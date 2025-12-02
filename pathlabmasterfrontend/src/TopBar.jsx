export default function TopBar() {
  return (
    <div style={styles.container}>
      {/* Left Logo */}
      <div style={styles.leftSection}>
        <img
          src="/logo.png"   // <-- Replace with your logo path
          alt="Logo"
          style={styles.logo}
        />

        {/* Menu Items */}
        <div style={styles.menuItems}>
          <div style={styles.menuItem}>
            <span style={styles.icon}>🧪</span>
            <span style={styles.label}>Lab</span>
          </div>

          <div style={styles.menuItem}>
            <span style={styles.icon}>₹</span>
            <span style={styles.label}>Bill</span>
          </div>

          <div style={styles.menuItem}>
            <span style={styles.icon}>📊</span>
            <span style={styles.label}>Report</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>

        {/* Payment Warning */}
        <div style={styles.paymentAlert}>Payment due 6 day(s) Left!</div>

        {/* Help Icon */}
        <div style={styles.helpIcon}>?</div>

        {/* Date Box */}
        <div style={styles.dateBox}>
          <div>02-Dec-2025</div>
          <div>12:14 Asia/Calcutta</div>
        </div>

        {/* User Info */}
        <div style={styles.userInfo}>
          <div>Shivani Katte</div>
          <div style={styles.subtext}>Swara Computerized Clinic</div>
        </div>

        {/* Menu Icon */}
        <div style={styles.menuButton}>☰</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    background: "#005d9b",
    color: "white",
    padding: "5px 15px",
    justifyContent: "space-between",
    height: "60px"
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "25px"
  },

  logo: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "white",
    padding: "5px"
  },

  menuItems: {
    display: "flex",
    alignItems: "center",
    gap: "25px"
  },

  menuItem: {
    textAlign: "center",
    cursor: "pointer"
  },

  icon: {
    fontSize: "22px",
    display: "block"
  },

  label: {
    fontSize: "14px"
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },

  paymentAlert: {
    background: "#ff5722",
    padding: "5px 10px",
    borderRadius: "5px",
    fontWeight: "bold"
  },

  helpIcon: {
    border: "2px solid white",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    textAlign: "center",
    lineHeight: "22px",
    cursor: "pointer"
  },

  dateBox: {
    border: "1px solid white",
    padding: "4px 8px",
    borderRadius: "5px",
    fontSize: "12px",
    textAlign: "right"
  },

  userInfo: {
    textAlign: "right",
    fontSize: "13px"
  },

  subtext: {
    fontSize: "11px",
    opacity: 0.8
  },

  menuButton: {
    fontSize: "22px",
    cursor: "pointer"
  }
};
