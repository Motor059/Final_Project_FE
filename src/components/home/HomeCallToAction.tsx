import { useNavigate } from 'react-router-dom';

export default function HomeCallToAction() {
  const navigate = useNavigate();
  return (
    <section id="start" style={{"padding": "0 0 72px"}}>
      <div className="wrap">
        <div className="dv-reveal" style={{"position": "relative", "overflow": "hidden", "background": "#0A0A0A", "borderRadius": "36px", "padding": "80px 56px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "32px 48px"}}>
          <div id="dv-cta-glow" aria-hidden="true" style={{"position": "absolute", "right": "-140px", "top": "-180px", "width": "720px", "height": "620px", "pointerEvents": "none", "background": "radial-gradient(42% 46% at 62% 40%, rgba(139,124,255,0.34), transparent 72%), radial-gradient(40% 45% at 34% 62%, rgba(124,196,255,0.24), transparent 72%), radial-gradient(36% 40% at 72% 82%, rgba(124,224,195,0.18), transparent 72%)", "filter": "blur(22px)"}} />
          <svg aria-hidden="true" style={{"position": "absolute", "left": "0", "top": "0", "width": "100%", "height": "100%", "pointerEvents": "none", "opacity": ".35", "mixBlendMode": "screen"}}>
            <rect width="100%" height="100%" filter="url(#dv-home-grain-white)" />
          </svg>
          <div style={{"position": "relative", "maxWidth": "560px"}}>
            <h2 style={{"margin": "0 0 14px", "fontSize": "clamp(30px,3.2vw,44px)", "lineHeight": "1.15", "fontWeight": "700", "letterSpacing": "-0.03em", "color": "#FFFFFF", "wordBreak": "keep-all"}} className="dv-section-heading">
              <span style={{"whiteSpace": "nowrap"}}>
                <span className="dv-sw" style={{ transitionDelay: "0.00s" }}>실전</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.06s" }}>면접</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.12s" }}>전에,</span>
              </span>
              <br />
              <span style={{"whiteSpace": "nowrap"}}>
                <span className="dv-sw" style={{ transitionDelay: "0.18s" }}>여기서</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.24s" }}>먼저</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.30s" }}>연습하세요</span>
              </span>
            </h2>
            <p style={{"margin": "0", "fontSize": "16.5px", "lineHeight": "1.65", "color": "#B8B3AD", "wordBreak": "keep-all"}}>
              기업 유형과 면접 단계만 고르면 바로 시작할 수 있어요.
            </p>
          </div>
          <div style={{"position": "relative", "display": "flex", "gap": "10px", "flexWrap": "wrap"}}>
            <button className="dv-btn-white" type="button" onClick={() => navigate('/setup')}>
              모의면접 시작
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
