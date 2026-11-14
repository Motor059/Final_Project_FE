import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import './page-motion.css';

const targets = [
  '.member-page-heading > *', '.member-history-stat', '.member-section-title',
  '.member-subsection-title', '.member-history-card', '.member-empty-state',
  '.member-profile-section', '.member-documents-heading', '.member-document-card',
  '.member-setting-card', '.member-questions-section', '[aria-labelledby="member-account-title"]',
  '.archive-page .hero h1', '.archive-page .hero p',
  '.archive-page .hero .stat', '.archive-page .hero .search', '.archive-page .panel.filters',
  '.pt-ref .pv-head > *', '.pt-ref .form > .field', '.pt-ref .su-sub > .field',
  '.pt-ref .pt-task-slot', '.pt-ref .pt-side > .pt-card',
  '.pt-ref .pt-stage > .pt-ctx', '.pt-ref .pt-stage > .pt-fchip',
].join(',');

export default function PageMotion() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);
  useLayoutEffect(() => {
    if (previousPath.current !== pathname && navigationType !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' });
    previousPath.current = pathname;
  }, [pathname, navigationType]);

  useLayoutEffect(() => {
    if (!/^\/(setup|history|mypage|archive)(\/|$)|^\/pt\/(preparation|presentation)$/.test(pathname)) return;
    const root = document.getElementById('root');
    if (!root) return;
    const elements = new Set<HTMLElement>();
    let scanFrame = 0;
    let observerAlive = false;
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      observerAlive = true;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.pageMotion = 'visible';
          observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' }) : null;
    const scan = () => {
      scanFrame = 0;
      root.querySelectorAll<HTMLElement>(targets).forEach((element) => {
        if (elements.has(element) || element.closest('[aria-busy="true"], [aria-hidden="true"]')) return;
        if (element.parentElement?.closest('[data-page-motion]')) return;
        elements.add(element);
        const index = element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : 0;
        const isTitle = element.matches('h1, .pv-h1');
        const isCard = element.matches('.member-history-card, .member-document-card, .member-history-stat');
        const delay = isCard ? 160 + Math.min(index, 3) * 90 : Math.min(index, 4) * 90;
        element.style.setProperty('--page-enter-delay', `${delay}ms`);
        element.dataset.pageMotionKind = isTitle ? 'title' : 'content';
        element.dataset.pageMotion = observer ? 'pending' : 'visible';
        observer?.observe(element);
      });
    };
    const requestScan = () => {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan);
    };
    const mutations = new MutationObserver(requestScan);
    scan();
    mutations.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy', 'hidden'] });
    window.addEventListener('resize', requestScan);
    const fallback = window.setTimeout(() => {
      if (!observerAlive) elements.forEach((element) => { element.dataset.pageMotion = 'visible'; });
    }, 1500);
    return () => {
      observer?.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', requestScan);
      cancelAnimationFrame(scanFrame);
      clearTimeout(fallback);
      elements.forEach((element) => {
        delete element.dataset.pageMotion;
        delete element.dataset.pageMotionKind;
        element.style.removeProperty('--page-enter-delay');
      });
    };
  }, [pathname]);
  return null;
}
