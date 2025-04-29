<?php
try {
    $host = '127.0.0.1';
    $port = '3306';
    $database = 'hirakatakan';
    $username = 'root';
    $password = '123';
    
    // Membuat koneksi
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$database;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Koneksi database berhasil!\n";
    echo "ℹ️ Informasi server : " . $conn->getAttribute(PDO::ATTR_SERVER_INFO) . "\n";
    echo "🧬 Versi server     : " . $conn->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n\n";

    // Query ambil data
    $sql = "SELECT * FROM categories"; // Ganti dengan nama tabel kamu
    $stmt = $conn->query($sql);

    // Menampilkan data
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($results) > 0) {
        foreach ($results as $row) {
            echo "🧑 ID: " . $row['id'] . " | Nama: " . $row['name'] . "\n"; // Sesuaikan field-nya
        }
    } else {
        echo "Tidak ada data ditemukan di tabel.\n";
    }

} catch (PDOException $e) {
    echo "❌ Koneksi atau query gagal : " . $e->getMessage() . "\n";
}
