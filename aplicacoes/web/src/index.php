<?php
$apiUrl = getenv('API_URL') ?: 'http://localhost:8000';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>LinkMark</title>
    <link rel="stylesheet" href="/assets/css/app.css"/>
</head>
<body>
<header class="header">
    <div class="logo"></div>
    <div class="title">LinkMark · Web</div>
</header>

<div class="container">
    <div class="panel">

    </div>

    <div class="panel" style="margin-top: 16px;">

    </div>

    <div class="footer">
        Dica: a variável de ambiente API_URL atual é <code><?php echo htmlspecialchars($apiUrl, ENT_QUOTES); ?></code>
    </div>
</div>

<script>
    window.__CONFIG__ = {API_URL: <?php echo json_encode($apiUrl); ?> };
</script>
<script src="/assets/js/app.js"></script>
</body>
</html>
