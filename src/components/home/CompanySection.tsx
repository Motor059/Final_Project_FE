export default function CompanySection() {
  return (
    <section id="companies" style={{"padding": "0 0 112px"}}>
      <div className="wrap">
        <div className="dv-reveal" style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(min(340px,100%),1fr))", "gap": "20px 64px", "alignItems": "end", "marginBottom": "36px"}}>
          <h2 style={{"margin": "0", "fontSize": "clamp(30px,3.2vw,44px)", "lineHeight": "1.15", "fontWeight": "700", "letterSpacing": "-0.03em", "color": "#0A0A0A", "wordBreak": "keep-all", "textWrap": "balance"}} className="dv-section-heading">
            <span className="dv-sw" style={{ transitionDelay: "0.00s" }}>지원하는</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.06s" }}>기업</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.12s" }}>유형에</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.18s" }}>맞춰</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.24s" }}>질문이</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.30s" }}>달라져요</span>
          </h2>
          <p className="dv-company-intro" style={{"margin": "0", "maxWidth": "460px", "fontSize": "16.5px", "lineHeight": "1.65", "color": "#57534E", "wordBreak": "keep-all"}}>
            <span>기업 유형에 따라 질문과 평가 기준이 달라요.</span>{' '}
            <span>채용공고와 서류를 더하면 내 경험에 맞춰 질문해요.</span>
          </p>
        </div>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(min(300px,100%),1fr))", "gap": "16px"}}>
          <article className="dv-card dv-reveal dv-glow" style={{"position": "relative", "overflow": "hidden", "padding": "32px", "minHeight": "200px", "display": "flex", "flexDirection": "column", "justifyContent": "flex-start"}}>
            <div aria-hidden="true" style={{"position": "absolute", "right": "-80px", "top": "-90px", "width": "260px", "height": "260px", "borderRadius": "50%", "background": "radial-gradient(circle at 50% 50%, rgba(139,124,255,0.26), transparent 68%)", "filter": "blur(14px)"}} />
            <div style={{"position": "relative"}}>
              <h3 style={{"margin": "0 0 6px", "fontSize": "22px", "fontWeight": "600", "color": "#0A0A0A"}}>
                대기업 SW
              </h3>
              <div style={{"fontSize": "14px", "color": "#8A857D"}}>
                삼성, SK하이닉스, LG CNS
              </div>
            </div>
            <p style={{"position": "relative", "margin": "24px 0 0", "fontSize": "15px", "lineHeight": "1.6", "color": "#44403C", "wordBreak": "keep-all"}}>
              직무 PT와 인성, 임원 면접까지 구조화된 질문으로 연습해요.
            </p>
          </article>
          <article className="dv-card dv-reveal dv-glow" style={{"position": "relative", "overflow": "hidden", "padding": "32px", "minHeight": "200px", "display": "flex", "flexDirection": "column", "justifyContent": "flex-start"}}>
            <div aria-hidden="true" style={{"position": "absolute", "right": "-80px", "top": "-90px", "width": "260px", "height": "260px", "borderRadius": "50%", "background": "radial-gradient(circle at 50% 50%, rgba(124,196,255,0.28), transparent 68%)", "filter": "blur(14px)"}} />
            <div style={{"position": "relative"}}>
              <h3 style={{"margin": "0 0 6px", "fontSize": "22px", "fontWeight": "600", "color": "#0A0A0A"}}>
                서비스 기업
              </h3>
              <div style={{"fontSize": "14px", "color": "#8A857D"}}>
                네이버, 카카오, 쿠팡, 배민
              </div>
            </div>
            <p style={{"position": "relative", "margin": "24px 0 0", "fontSize": "15px", "lineHeight": "1.6", "color": "#44403C", "wordBreak": "keep-all"}}>
              프로젝트 경험과 기술 선택의 이유를 끝까지 파고들어요.
            </p>
          </article>
          <article className="dv-card dv-reveal dv-glow" style={{"position": "relative", "overflow": "hidden", "padding": "32px", "minHeight": "200px", "display": "flex", "flexDirection": "column", "justifyContent": "flex-start"}}>
            <div aria-hidden="true" style={{"position": "absolute", "right": "-80px", "top": "-90px", "width": "260px", "height": "260px", "borderRadius": "50%", "background": "radial-gradient(circle at 50% 50%, rgba(124,224,195,0.28), transparent 68%)", "filter": "blur(14px)"}} />
            <div style={{"position": "relative"}}>
              <h3 style={{"margin": "0 0 6px", "fontSize": "22px", "fontWeight": "600", "color": "#0A0A0A"}}>
                금융 IT
              </h3>
              <div style={{"fontSize": "14px", "color": "#8A857D"}}>
                토스, 카카오뱅크, 은행과 증권사 IT
              </div>
            </div>
            <p style={{"position": "relative", "margin": "24px 0 0", "fontSize": "15px", "lineHeight": "1.6", "color": "#44403C", "wordBreak": "keep-all"}}>
              기술뿐 아니라 금융 도메인, 보안, 규제 감각까지 함께 봐요.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
