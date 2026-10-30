const companies = ['삼성전자', '네이버', '카카오', '토스', '쿠팡', 'LG CNS', '카카오뱅크', 'SK하이닉스', '배달의민족'];

export default function CompanyMarquee() {
  return (
    <section className="dv-marquee" aria-label="면접 방식을 참고한 기업">
      <div className="wrap dv-marquee-label">이런 기업들의 면접 방식을 바탕으로 연습해요</div>
      <div className="dv-marquee-mask">
        <div className="dv-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="dv-track-group" aria-hidden={copy === 1 ? true : undefined}>
              {companies.map((company) => <span key={company}>{company}</span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
