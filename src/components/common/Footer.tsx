export default function Footer() {
  return (
    <footer className="dv-home-footer">
      <div className="wrap dv-footer-row">
        <div className="dv-footer-brand">
          <img src="/devoir-logo.svg" alt="devoir" width="94" height="20" />
          <span className="dv-footer-tagline">떨리는 면접을 익숙한 면접으로</span>
        </div>
        <a className="dv-link" href="mailto:hello@devoir.kr">hello@devoir.kr</a>
      </div>
      <div className="wrap dv-footer-copyright">© {new Date().getFullYear()} Devoir</div>
    </footer>
  );
}
