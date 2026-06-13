exports.ErrorContent = async (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Out of Step | StepSphere</title>
      <link rel="preconnect" href="https://googleapis.com">
      <link rel="preconnect" href="https://gstatic.com" crossorigin>
      <link href="https://googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg: #0a0a0a;
          --accent: #d4af37;
          --text-main: #ffffff;
          --text-muted: #8e8e93;
          --glass: rgba(255, 255, 255, 0.03);
          --border: rgba(255, 255, 255, 0.08);
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--bg);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
        }
        body::before {
          content: '';
          position: absolute;
          width: 40vw;
          height: 40vw;
          background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, rgba(0,0,0,0) 70%);
          top: -10vw;
          right: -10vw;
          z-index: 1;
        }
        .wrapper {
          text-align: center;
          position: relative;
          z-index: 2;
          padding: 2rem;
          max-width: 550px;
          width: 100%;
        }
        .badge {
          display: inline-block;
          font-size: 0.8rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.5rem;
          border: 1px solid rgba(212,175,55,0.3);
          padding: 6px 16px;
          border-radius: 30px;
          background: rgba(212,175,55,0.02);
        }
        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 8vw, 5.5rem);
          font-weight: 300;
          line-height: 1;
          margin-bottom: 1.5rem;
          letter-spacing: -2px;
        }
        p.description {
          font-size: 1.05rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 3rem;
          font-weight: 300;
        }
        .action-layer {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .btn {
          width: 100%;
          max-width: 320px;
          padding: 16px;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .btn-primary {
          background-color: var(--text-main);
          color: var(--bg);
          border: 1px solid var(--text-main);
        }
        .btn-primary:hover {
          background-color: transparent;
          color: var(--text-main);
          transform: translateY(-2px);
        }
        .metadata {
          margin-top: 5rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="badge">Error 404</div>
        <h1>Archived Edition</h1>
        <p class="description">The silhouette, colorway, or specific pair you are chasing is completely out of stock, dropped from our rotation, or never existed. Let’s get your stride back on track.</p>
        
        <div class="action-layer">
          <a href="/user/home" class="btn btn-primary">Walk Back Home</a>
        </div>

        <div class="metadata">
          <span>IP / ${req.ip.replace('::ffff:', '')}</span>
          <span>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} PST</span>
        </div>
      </div>
    </body>
    </html>
  `;
  return res.status(404).send(htmlContent);
};

exports.userUnavailableError = async (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Access Suspended | StepSphere</title>
      <link rel="preconnect" href="https://googleapis.com">
      <link rel="preconnect" href="https://gstatic.com" crossorigin>
      <link href="https://googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg: #ffffff;
          --accent: #9e2a2b;
          --text-main: #121212;
          --text-muted: #6e6e73;
          --border: rgba(0, 0, 0, 0.08);
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--bg);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        body::before {
          content: '';
          position: absolute;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(158,42,43,0.03) 0%, rgba(255,255,255,0) 70%);
          bottom: -10vw;
          left: -10vw;
          z-index: 1;
        }
        .wrapper {
          text-align: center;
          position: relative;
          z-index: 2;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background-color: var(--accent);
          border-radius: 50%;
          margin: 0 auto 1.5rem auto;
          box-shadow: 0 0 12px var(--accent);
        }
        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 6vw, 3.8rem);
          font-weight: 400;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }
        p.description {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 3.5rem;
          font-weight: 400;
        }
        .action-layer {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .btn {
          width: 100%;
          max-width: 320px;
          padding: 16px;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .btn-primary {
          background-color: var(--text-main);
          color: var(--bg);
          border: 1px solid var(--text-main);
        }
        .btn-primary:hover {
          background-color: transparent;
          color: var(--text-main);
          transform: translateY(-2px);
        }
        .btn-secondary {
          background-color: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border);
          margin-top: 4px;
        }
        .btn-secondary:hover {
          color: var(--text-main);
          border-color: var(--text-main);
        }
        .footer-note {
          margin-top: 4.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="status-dot"></div>
        <h1>Account Notice</h1>
        <p class="description">Your profile is no longer verified inside the StepSphere database ecosystem. If this status is unexpected or you need to check your order history, connect with our support desk.</p>
        
        <div class="action-layer">
          <a href="mailto:clothifyfashionshop@gmail.com" 
             onclick="window.open('https://google.com...', '_blank'); return false;" 
             class="btn btn-primary">
             Contact Concierge
          </a>
          <a href="/user/logout" class="btn btn-secondary">Exit Session</a>
        </div>

        <p class="footer-note">StepSphere Footwear Network Security</p>
      </div>
    </body>
    </html>
  `;
  return res.status(403).send(htmlContent);
};

