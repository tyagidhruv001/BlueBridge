import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";var r=e(t(),1),i=`﻿<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>Add Money to Wallet | BlueBridge</title>\r
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
            margin-bottom: 0.5rem;\r
        }\r
\r
        .amount-selection {\r
            margin: 2rem 0;\r
        }\r
\r
        .amount-grid {\r
            display: grid;\r
            grid-template-columns: repeat(3, 1fr);\r
            gap: 1rem;\r
            margin-bottom: 1.5rem;\r
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
        .custom-amount {\r
            margin-top: 1rem;\r
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
        .custom-amount input:focus {\r
            border-color: #667eea;\r
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
            transition: transform 0.2s;\r
        }\r
\r
        .pay-btn:hover {\r
            transform: scale(1.02);\r
        }\r
\r
        .pay-btn:disabled {\r
            opacity: 0.5;\r
            cursor: not-allowed;\r
        }\r
\r
        .info-box {\r
            background: #f0f7ff;\r
            border-left: 4px solid #667eea;\r
            padding: 1rem;\r
            border-radius: 8px;\r
            margin-top: 1.5rem;\r
            color: #333;\r
        }\r
\r
        .info-box ul {\r
            margin-left: 1.5rem;\r
            margin-top: 0.5rem;\r
        }\r
\r
        .back-btn {\r
            display: inline-block;\r
            margin-bottom: 1rem;\r
            color: white;\r
            text-decoration: none;\r
            font-size: 1.1rem;\r
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
            border: 1px solid #c3e6cb;\r
        }\r
\r
        .alert.error {\r
            background: #f8d7da;\r
            color: #721c24;\r
            border: 1px solid #f5c6cb;\r
        }\r
    </style>\r
</head>\r
\r
<body>\r
    <div class="container">\r
        <a href="../dashboard/customer/customer-dashboard.html" class="back-btn">\r
            <i class="fas fa-arrow-left"></i> Back to Dashboard\r
        </a>\r
\r
        <div class="header">\r
            <h1>💰 Add Money to Wallet</h1>\r
            <p>Top up your BlueBridge wallet instantly</p>\r
        </div>\r
\r
        <div class="wallet-card">\r
            <div class="balance-section">\r
                <div class="balance-label">Current Wallet Balance</div>\r
                <div class="balance-amount" id="current-balance">₹0</div>\r
            </div>\r
\r
            <div class="amount-selection">\r
                <h3 style="margin-bottom: 1rem;">Select Amount</h3>\r
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
                    <input type="number" id="custom-amount" placeholder="Or enter custom amount (min ₹10)" min="10"\r
                        max="100000">\r
                </div>\r
            </div>\r
\r
            <button class="pay-btn" id="pay-btn" onclick="initiatePayment()" disabled>\r
                <i class="fas fa-lock"></i> Proceed to Payment\r
            </button>\r
\r
            <div class="alert" id="alert-box"></div>\r
\r
            <div class="info-box">\r
                <strong><i class="fas fa-info-circle"></i> Payment Info:</strong>\r
                <ul>\r
                    <li>Supports UPI, Cards, Net Banking, Wallets</li>\r
                    <li>100% secure payment via Razorpay</li>\r
                    <li>Money added instantly to your wallet</li>\r
                    <li>Minimum: ₹10 | Maximum: ₹1,00,000</li>\r
                </ul>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Razorpay Checkout -->\r
    \r
\r
    \r
</body>\r
\r
</html>\r
`,a=n(),o=()=>((0,r.useEffect)(()=>{},[]),(0,a.jsx)(`div`,{dangerouslySetInnerHTML:{__html:i}}));export{o as default};