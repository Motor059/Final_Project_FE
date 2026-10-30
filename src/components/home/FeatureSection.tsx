export default function FeatureSection() {
  return (
    <section id="how" style={{"padding": "0 0 112px"}}>
      <div className="wrap">
        <div className="dv-reveal" style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(min(340px,100%),1fr))", "gap": "20px 64px", "alignItems": "end", "marginBottom": "36px"}}>
          <h2 style={{"margin": "0", "fontSize": "clamp(30px,3.2vw,44px)", "lineHeight": "1.15", "fontWeight": "700", "letterSpacing": "-0.03em", "color": "#0A0A0A", "wordBreak": "keep-all", "textWrap": "balance"}} className="dv-section-heading">
            <span className="dv-sw" style={{ transitionDelay: "0.00s" }}>면접</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.06s" }}>하나를</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.12s" }}>처음부터</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.18s" }}>끝까지</span>{" "}<span className="dv-sw" style={{ transitionDelay: "0.24s" }}>실전처럼</span>
          </h2>
          <p style={{"margin": "0", "maxWidth": "460px", "fontSize": "16.5px", "lineHeight": "1.65", "color": "#57534E", "wordBreak": "keep-all"}}>
            듣고, 말하고, 이어지는 꼬리 질문에 답하다 보면 면접 하나가 끝나요. 점수보다 중요한 건 다음에 무엇을 바꿀지예요.
          </p>
        </div>
        <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(min(300px,100%),1fr))", "gap": "16px"}}>
          <article className="dv-card dv-reveal" style={{"padding": "16px 16px 28px"}}>
            <div style={{"background": "#FFFFFF", "borderRadius": "20px", "height": "220px", "padding": "24px", "display": "flex", "flexDirection": "column", "justifyContent": "space-between"}}>
              <div style={{"fontSize": "15px", "lineHeight": "1.55", "color": "#1C1917", "wordBreak": "keep-all"}}>
                최근 프로젝트에서 동시성 문제를 겪은 경험을 말씀해 주세요.
              </div>
              <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "4px", "height": "44px"}}>
                <span className="dv-bar" style={{"height": "8px", "opacity": ".4", "animationDuration": "1.1s", "animationDelay": ".40s"}} />
                <span className="dv-bar" style={{"height": "12px", "opacity": ".5", "animationDuration": ".9s", "animationDelay": ".32s"}} />
                <span className="dv-bar" style={{"height": "18px", "opacity": ".6", "animationDuration": "1s", "animationDelay": ".24s"}} />
                <span className="dv-bar" style={{"height": "26px", "opacity": ".75", "animationDuration": ".8s", "animationDelay": ".16s"}} />
                <span className="dv-bar" style={{"height": "34px", "opacity": ".9", "animationDuration": ".95s", "animationDelay": ".08s"}} />
                <span className="dv-bar" style={{"height": "38px", "opacity": "1", "animationDuration": ".85s"}} />
                <span className="dv-bar" style={{"height": "34px", "opacity": ".9", "animationDuration": "1.05s", "animationDelay": ".08s"}} />
                <span className="dv-bar" style={{"height": "26px", "opacity": ".75", "animationDuration": ".9s", "animationDelay": ".16s"}} />
                <span className="dv-bar" style={{"height": "18px", "opacity": ".6", "animationDuration": "1s", "animationDelay": ".24s"}} />
                <span className="dv-bar" style={{"height": "12px", "opacity": ".5", "animationDuration": ".85s", "animationDelay": ".32s"}} />
                <span className="dv-bar" style={{"height": "8px", "opacity": ".4", "animationDuration": "1.1s", "animationDelay": ".40s"}} />
              </div>
            </div>
            <h3 style={{"margin": "24px 8px 6px", "fontSize": "18px", "fontWeight": "600", "color": "#0A0A0A"}}>
              목소리로 묻고 답해요
            </h3>
            <p style={{"margin": "0 8px", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#57534E", "wordBreak": "keep-all"}}>
              면접관이 질문을 말로 건네고, 질문이 끝나면 바로 답변 녹음이 시작돼요.
            </p>
          </article>
          <article className="dv-card dv-reveal" style={{"padding": "16px 16px 28px"}}>
            <div className="dv-seq" style={{"background": "#FFFFFF", "borderRadius": "20px", "height": "220px", "padding": "20px", "display": "flex", "flexDirection": "column", "gap": "8px", "justifyContent": "center"}}>
              <div style={{"alignSelf": "flex-start", "maxWidth": "86%", "fontSize": "13.5px", "lineHeight": "1.45", "color": "#1C1917", "background": "#F4F3F1", "padding": "9px 13px", "borderRadius": "14px 14px 14px 4px", "wordBreak": "keep-all"}}>
                왜 DB 락이 아니라 Redis 락을 고르셨나요?
              </div>
              <div style={{"alignSelf": "flex-end", "maxWidth": "86%", "fontSize": "13.5px", "lineHeight": "1.45", "color": "#FFFFFF", "background": "#0A0A0A", "padding": "9px 13px", "borderRadius": "14px 14px 4px 14px", "wordBreak": "keep-all"}}>
                커넥션을 오래 잡으면 병목이 될 것 같았습니다
              </div>
              <div style={{"alignSelf": "flex-start", "maxWidth": "86%", "fontSize": "13.5px", "lineHeight": "1.45", "color": "#1C1917", "background": "#F4F3F1", "padding": "9px 13px", "borderRadius": "14px 14px 14px 4px", "wordBreak": "keep-all"}}>
                트래픽이 열 배가 되면 어떻게 하시겠어요?
              </div>
            </div>
            <h3 style={{"margin": "24px 8px 6px", "fontSize": "18px", "fontWeight": "600", "color": "#0A0A0A"}}>
              답변에 따라 파고들어요
            </h3>
            <p style={{"margin": "0 8px", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#57534E", "wordBreak": "keep-all"}}>
              방금 한 답변을 바탕으로 '왜', '만약에', '조금 더 구체적으로'를 묻는 꼬리 질문이 이어져요.
            </p>
          </article>
          <article className="dv-card dv-reveal" style={{"padding": "16px 16px 28px"}}>
            <div style={{"background": "#FFFFFF", "borderRadius": "20px", "height": "220px", "padding": "24px", "display": "flex", "flexDirection": "column", "justifyContent": "space-between"}}>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "10px"}}>
                <span style={{"fontSize": "12.5px", "fontWeight": "600", "color": "#8A857D"}}>
                  다음 면접에서 바꿀 한 가지
                </span>
                <div className="dv-coach" style={{"fontSize": "19px", "lineHeight": "1.45", "fontWeight": "600", "letterSpacing": "-0.01em", "color": "#0A0A0A", "wordBreak": "keep-all"}}>
                  모든 답변을 ‘그래서 얼마나 좋아졌는지’로 끝내 보세요
                </div>
              </div>
              <div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "paddingTop": "14px", "borderTop": "1px solid #ECEBE8"}}>
                <span style={{"fontSize": "13px", "color": "#8A857D"}}>
                  종합 점수
                </span>
                <span style={{"display": "flex", "alignItems": "baseline", "gap": "3px"}}>
                  <span className="dv-count" data-to="78" style={{"fontSize": "22px", "fontWeight": "650", "letterSpacing": "-0.02em", "color": "#0A0A0A", "fontVariantNumeric": "tabular-nums"}}>
                    78
                  </span>
                  <span style={{"fontSize": "13px", "color": "#8A857D"}}>
                    점
                  </span>
                </span>
              </div>
            </div>
            <h3 style={{"margin": "24px 8px 6px", "fontSize": "18px", "fontWeight": "600", "color": "#0A0A0A"}}>
              다음 면접을 바꾸는 코칭
            </h3>
            <p style={{"margin": "0 8px", "fontSize": "14.5px", "lineHeight": "1.6", "color": "#57534E", "wordBreak": "keep-all"}}>
              반복되는 약점 하나, 바로 쓸 수 있는 행동, 고쳐 쓴 답변 예시까지 받아요.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
