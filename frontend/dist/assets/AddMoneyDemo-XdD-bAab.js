import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";var r=e(t(),1),i=`﻿<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>Add Money - Demo Mode | BlueBridge</title>\r
    \r
\r
    <style>\r
        * {\r
            margin: 0;\r
            padding: 0;\r
            box-sizing: border-box;\r
        }\r
\r
        body {\r
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\r
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\r
            min-height: 100vh;\r
            padding: 2rem;\r
            color: #fff;\r
        }\r
\r
        .container {\r
            max-width: 600px;\r
            margin: 0 auto;\r
        }\r
\r
        .demo-badge {\r
            background: #ff9800;\r
            color: white;\r
            padding: 0.5rem 1rem;\r
            border-radius: 8px;\r
            text-align: center;\r
            margin-bottom: 1rem;\r
            font-weight: 600;\r
        }\r
\r
        .header {\r
            text-align: center;\r
            margin-bottom: 2rem;\r
        }\r
\r
        .header h1 {\r
            font-size: 2rem;\r
            margin-bottom: 0.5rem;\r
        }\r
\r
        .wallet-card {\r
            background: rgba(255, 255, 255, 0.95);\r
            border-radius: 20px;\r
            padding: 2rem;\r
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);\r
            color: #333;\r
            margin-bottom: 2rem;\r
        }\r
\r
        .balance-section {\r
            text-align: center;\r
            padding: 2rem;\r
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\r
            border-radius: 15px;\r
            margin-bottom: 2rem;\r
            color: #fff;\r
        }\r
\r
        .balance-label {\r
            font-size: 0.9rem;\r
            opacity: 0.9;\r
            margin-bottom: 0.5rem;\r
        }\r
\r
        .balance-amount {\r
            font-size: 3rem;\r
            font-weight: 700;\r
        }\r
\r
        .amount-grid {\r
            display: grid;\r
            grid-template-columns: repeat(3, 1fr);\r
            gap: 1rem;\r
            margin: 2rem 0 1.5rem;\r
        }\r
\r
        .amount-btn {\r
            padding: 1.5rem;\r
            border: 2px solid #667eea;\r
            background: white;\r
            border-radius: 12px;\r
            cursor: pointer;\r
            font-size: 1.2rem;\r
            font-weight: 600;\r
            color: #667eea;\r
            transition: all 0.3s;\r
        }\r
\r
        .amount-btn:hover {\r
            background: #667eea;\r
            color: white;\r
            transform: translateY(-2px);\r
        }\r
\r
        .amount-btn.selected {\r
            background: #667eea;\r
            color: white;\r
        }\r
\r
        .custom-amount input {\r
            width: 100%;\r
            padding: 1rem;\r
            border: 2px solid #e0e0e0;\r
            border-radius: 12px;\r
            font-size: 1.1rem;\r
            outline: none;\r
        }\r
\r
        .pay-btn {\r
            width: 100%;\r
            padding: 1.2rem;\r
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\r
            color: white;\r
            border: none;\r
            border-radius: 12px;\r
            font-size: 1.1rem;\r
            font-weight: 600;\r
            cursor: pointer;\r
            margin-top: 1.5rem;\r
        }\r
\r
        .pay-btn:disabled {\r
            opacity: 0.5;\r
        }\r
\r
        .alert {\r
            padding: 1rem;\r
            border-radius: 12px;\r
            margin-top: 1rem;\r
            display: none;\r
        }\r
\r
        .alert.success {\r
            background: #d4edda;\r
            color: #155724;\r
        }\r
\r
        .info-box {\r
            background: #fff3cd;\r
            border-left: 4px solid #ff9800;\r
            padding: 1rem;\r
            border-radius: 8px;\r
            margin-top: 1.5rem;\r
            color: #333;\r
        }\r
    </style>\r
</head>\r
\r
<body>\r
    <div class="container">\r
        <div class="demo-badge">\r
            🚀 DEMO MODE - No real payment needed\r
        </div>\r
\r
        <div class="header">\r
            <h1>💰 Add Money to Wallet</h1>\r
            <p>Test wallet functionality (Demo Mode)</p>\r
        </div>\r
\r
        <div class="wallet-card">\r
            <div class="balance-section">\r
                <div class="balance-label">Current Balance</div>\r
                <div class="balance-amount" id="balance">₹0</div>\r
            </div>\r
\r
            <h3>Select Amount</h3>\r
            <div class="amount-grid">\r
                <button class="amount-btn" onclick="selectAmount(100)">₹100</button>\r
                <button class="amount-btn" onclick="selectAmount(500)">₹500</button>\r
                <button class="amount-btn" onclick="selectAmount(1000)">₹1000</button>\r
                <button class="amount-btn" onclick="selectAmount(2000)">₹2000</button>\r
                <button class="amount-btn" onclick="selectAmount(5000)">₹5000</button>\r
                <button class="amount-btn" onclick="selectAmount(10000)">₹10000</button>\r
            </div>\r
\r
            <div class="custom-amount">\r
                <input type="number" id="custom-amount" placeholder="Or enter custom amount" min="10">\r
            </div>\r
\r
            <button class="pay-btn" id="pay-btn" onclick="simulatePayment()" disabled>\r
                Add Money (Demo)\r
            </button>\r
\r
            <div class="alert success" id="alert"></div>\r
\r
            <div class="info-box">\r
                <strong>📝 Demo Mode Active</strong><br>\r
                This is a demonstration. Money is added instantly without real payment.<br><br>\r
                <strong>To enable real payments:</strong><br>\r
                1. Get Razorpay API keys from https://razorpay.com<br>\r
                2. Add keys to backend/.env<br>\r
                3. Use add-money.html instead\r
            </div>\r
        </div>\r
    </div>\r
\r
    \r
</body>\r
\r
</html>\r
\r
`,a=n(),o=()=>((0,r.useEffect)(()=>{},[]),(0,a.jsx)(`div`,{dangerouslySetInnerHTML:{__html:i}}));export{o as default};