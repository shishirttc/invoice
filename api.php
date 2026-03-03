<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -- MySQL Configuration (Local XAMPP) --
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "invoice_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$data = json_decode(file_get_contents('php://input'), true);

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    global $conn;
    $conn->close();
    exit();
}

try {
    // --- Company Endpoints ---
    if (preg_match('/\/api\/company/', $path)) {
        if ($method == 'GET') {
            $result = $conn->query("SELECT * FROM company WHERE id = 1");
            respond($result->fetch_assoc() ?: new stdClass());
        } elseif ($method == 'POST') {
            $stmt = $conn->prepare("INSERT INTO company (id, name, address, phone, email, website, taxId, logoUrl) VALUES (1, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, address=?, phone=?, email=?, website=?, taxId=?, logoUrl=?");
            $stmt->bind_param("ssssssssssssss", $data['name'], $data['address'], $data['phone'], $data['email'], $data['website'], $data['taxId'], $data['logoUrl'], $data['name'], $data['address'], $data['phone'], $data['email'], $data['website'], $data['taxId'], $data['logoUrl']);
            $stmt->execute();
            respond(["message" => "Company updated"]);
        }
    }

    // --- Customer Endpoints ---
    if (preg_match('/\/api\/customers(?:\/(.*))?/', $path, $matches)) {
        $id = $matches[1] ?? null;
        if ($method == 'GET') {
            $result = $conn->query("SELECT * FROM customers");
            respond($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($method == 'POST') {
            $stmt = $conn->prepare("INSERT INTO customers (id, name, email, phone, address, balance) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, email=?, phone=?, address=?, balance=?");
            $stmt->bind_param("sssssdsssssd", $data['id'], $data['name'], $data['email'], $data['phone'], $data['address'], $data['balance'], $data['name'], $data['email'], $data['phone'], $data['address'], $data['balance']);
            $stmt->execute();
            respond(["message" => "Customer saved"]);
        } elseif ($method == 'DELETE' && $id) {
            $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            respond(["message" => "Customer deleted"]);
        }
    }

    // --- Inventory Endpoints ---
    if (preg_match('/\/api\/inventory(?:\/(.*))?/', $path, $matches)) {
        $id = $matches[1] ?? null;
        if ($method == 'GET') {
            $result = $conn->query("SELECT * FROM inventory");
            respond($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($method == 'POST') {
            $stmt = $conn->prepare("INSERT INTO inventory (id, name, description, price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, description=?, price=?");
            $stmt->bind_param("sssdssd", $data['id'], $data['name'], $data['description'], $data['price'], $data['name'], $data['description'], $data['price']);
            $stmt->execute();
            respond(["message" => "Product saved"]);
        } elseif ($method == 'DELETE' && $id) {
            $stmt = $conn->prepare("DELETE FROM inventory WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            respond(["message" => "Product deleted"]);
        }
    }

    // --- Invoice Endpoints ---
    if (preg_match('/\/api\/invoices(?:\/(.*))?/', $path, $matches)) {
        $id = $matches[1] ?? null;
        if ($method == 'GET') {
            $result = $conn->query("SELECT * FROM invoices");
            $invoices = $result->fetch_all(MYSQLI_ASSOC);
            foreach ($invoices as &$inv) {
                $stmt = $conn->prepare("SELECT * FROM invoice_items WHERE invoiceId = ?");
                $stmt->bind_param("s", $inv['id']);
                $stmt->execute();
                $inv['items'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

                $stmt = $conn->prepare("SELECT * FROM payments WHERE invoiceId = ?");
                $stmt->bind_param("s", $inv['id']);
                $stmt->execute();
                $inv['payments'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            }
            respond($invoices);
        } elseif ($method == 'POST') {
            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare("INSERT INTO invoices (id, invoiceNumber, customerId, date, subtotal, taxRate, taxAmount, discount, total, amountPaid, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE invoiceNumber=?, customerId=?, date=?, subtotal=?, taxRate=?, taxAmount=?, discount=?, total=?, amountPaid=?, status=?, notes=?");
                
                $date = date('Y-m-d', strtotime($data['date']));
                
                $stmt->bind_param("ssssddddddssssssdddddds", 
                    $data['id'], $data['invoiceNumber'], $data['customerId'], $date, $data['subtotal'], $data['taxRate'], $data['taxAmount'], $data['discount'], $data['total'], $data['amountPaid'], $data['status'], $data['notes'],
                    $data['invoiceNumber'], $data['customerId'], $date, $data['subtotal'], $data['taxRate'], $data['taxAmount'], $data['discount'], $data['total'], $data['amountPaid'], $data['status'], $data['notes']
                );
                $stmt->execute();

                $stmt = $conn->prepare("DELETE FROM invoice_items WHERE invoiceId = ?");
                $stmt->bind_param("s", $data['id']);
                $stmt->execute();

                if (isset($data['items']) && is_array($data['items'])) {
                    $stmt = $conn->prepare("INSERT INTO invoice_items (id, invoiceId, productId, name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['items'] as $item) {
                        $stmt->bind_param("ssssidd", $item['id'], $data['id'], $item['productId'], $item['name'], $item['quantity'], $item['price'], $item['total']);
                        $stmt->execute();
                    }
                }
                
                $conn->commit();
                respond(["message" => "Invoice saved"]);
            } catch (Exception $e) {
                $conn->rollback();
                respond(["error" => $e->getMessage()], 500);
            }
        } elseif ($method == 'DELETE' && $id) {
            $stmt = $conn->prepare("DELETE FROM invoices WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            respond(["message" => "Invoice deleted"]);
        }
    }

    // --- Activity Log Endpoints ---
    if (preg_match('/\/api\/activities/', $path)) {
        if ($method == 'GET') {
            $result = $conn->query("SELECT * FROM activity_log ORDER BY timestamp DESC");
            respond($result->fetch_all(MYSQLI_ASSOC));
        } elseif ($method == 'POST') {
            $stmt = $conn->prepare("INSERT INTO activity_log (id, action, entityType, entityName, timestamp, details) VALUES (?, ?, ?, ?, ?, ?)");
            $timestamp = date('Y-m-d H:i:s', strtotime($data['timestamp']));
            $stmt->bind_param("ssssss", $data['id'], $data['action'], $data['entityType'], $data['entityName'], $timestamp, $data['details']);
            $stmt->execute();
            respond(["message" => "Activity logged"]);
        }
    }

    // --- Payment Endpoints ---
    if (preg_match('/\/api\/payments/', $path)) {
        if ($method == 'POST') {
            $stmt = $conn->prepare("INSERT INTO payments (id, invoiceId, date, amount, method, note) VALUES (?, ?, ?, ?, ?, ?)");
            $date = date('Y-m-d', strtotime($data['date']));
            $stmt->bind_param("sssdss", $data['id'], $data['invoiceId'], $date, $data['amount'], $data['method'], $data['note']);
            $stmt->execute();
            respond(["message" => "Payment added"]);
        }
    }

} catch (Exception $e) {
    respond(["error" => $e->getMessage()], 500);
}

respond(["error" => "Route not found"], 404);
?>