import React from "react";

const Footer: React.FC = () => (
  <footer
    style={{ padding: 16, borderTop: "1px solid #e5e7eb", marginTop: 24 }}
  >
    <small>© {new Date().getFullYear()} RowdyHacks XI</small>
  </footer>
);

export default Footer;
