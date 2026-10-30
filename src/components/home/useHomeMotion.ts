import { useEffect } from 'react';
import type { RefObject } from 'react';

export default function useHomeMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const home = ref.current;
    if (!home) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];
    const frames = new Set<number>();

    if (!reduce && 'IntersectionObserver' in window) {
      home.dataset.motion = 'on';
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('dv-in', 'dv-sw-in');
        observer.unobserve(entry.target);
      }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      home.querySelectorAll('.dv-reveal,.dv-section-heading').forEach((element) => observer.observe(element));
      cleanups.push(() => { observer.disconnect(); delete home.dataset.motion; });

      const counters = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counters.unobserve(entry.target);
        const element = entry.target as HTMLElement;
        const to = Number(element.dataset.to);
        if (!Number.isFinite(to)) return;
        let started: number | null = null;
        const tick = (time: number) => {
          if (started === null) started = time;
          const fraction = Math.min(1, (time - started) / 1400);
          element.textContent = String(Math.round(to * (1 - Math.pow(1 - fraction, 3))));
          if (fraction < 1) schedule(tick);
        };
        schedule(tick);
      }), { threshold: .4 });
      function schedule(action: FrameRequestCallback) {
        const id = requestAnimationFrame((time) => { frames.delete(id); action(time); });
        frames.add(id);
      }
      home.querySelectorAll('.dv-count[data-to]').forEach((element) => counters.observe(element));
      cleanups.push(() => counters.disconnect());
    }

    if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      home.querySelectorAll<HTMLElement>('.dv-card').forEach((card) => {
        card.classList.add('dv-tilt');
        const move = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
          card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          card.style.setProperty('--my', `${event.clientY - rect.top}px`);
        };
        const leave = () => { card.style.transform = ''; };
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', leave);
        cleanups.push(() => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); leave(); });
      });
      const hero = home.querySelector<HTMLElement>('.dv-home-hero');
      if (hero) {
        const move = (event: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          hero.style.setProperty('--sx', `${event.clientX - rect.left}px`);
          hero.style.setProperty('--sy', `${event.clientY - rect.top}px`);
          hero.classList.add('dv-hero-on');
        };
        const leave = () => hero.classList.remove('dv-hero-on');
        hero.addEventListener('pointermove', move);
        hero.addEventListener('pointerleave', leave);
        cleanups.push(() => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); });
      }
    }

    const progress = home.querySelector<HTMLElement>('.dv-home-progress');
    let scrollFrame = 0;
    const update = () => {
      scrollFrame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    };
    const scroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(update); };
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    update();
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      frames.forEach(cancelAnimationFrame);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
      cancelAnimationFrame(scrollFrame);
    };
  }, [ref]);
}
