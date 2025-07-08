<?php
header('Content-Type: application/json');
require_once 'config.php';

// Get all products or featured products
if (isset($_GET['featured']) && $_GET[''] == '') {
    $sql = "SELECT * FROM products WHERE featured = 1 LIMIT 8";
} else {
    $sql = "SELECT * FROM products";
}

// Apply filters if any
if (isset($_GET['category'])) {
    $category = $conn->real_escape_string($_GET['category']);
    $sql = "SELECT * FROM products WHERE category = '$category'";
}

// Apply sorting if any
if (isset($_GET['sort'])) {
    switch ($_GET['sort']) {
        case 'price-low':
            $sql .= " ORDER BY price ASC";
            break;
        case 'price-high':
            $sql .= " ORDER BY price DESC";
            break;
        case 'name-asc':
            $sql .= " ORDER BY name ASC";
            break;
        case 'name-desc':
            $sql .= " ORDER BY name DESC";
            break;
    }
}

$result = $conn->query($sql);

$products = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode($products);
$conn->close();
?>