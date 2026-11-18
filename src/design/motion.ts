// Motion / Animation tokens for Digital Sales CRM
// Motion for React (Framer Motion)

export const motion = {
  duration: {
    fast: 0.12,       // 120ms — button feedback, tooltips
    normal: 0.18,     // 180ms — dropdowns, badges
    modal: 0.2,       // 200ms — modals, dialogs
    drawer: 0.24,     // 240ms — drawers, sidebar
    card: 0.25,       // 250ms — card entrances
    slow: 0.35,       // 350ms — complex transitions
    page: 0.3,        // 300ms — page transitions
  },

  ease: {
    default: [0.25, 0.1, 0.25, 1],       // CSS ease
    out: [0, 0, 0.2, 1],                  // ease-out
    in: [0.4, 0, 1, 1],                   // ease-in
    inOut: [0.4, 0, 0.2, 1],              // ease-in-out
    spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
    springGentle: { type: 'spring' as const, stiffness: 300, damping: 25 },
    springBouncy: { type: 'spring' as const, stiffness: 500, damping: 20 },
  },
} as const;

// Reusable animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: motion.duration.normal },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: motion.duration.card, ease: motion.ease.out },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: motion.duration.card, ease: motion.ease.out },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: motion.duration.modal, ease: motion.ease.out },
};

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
  transition: { duration: motion.duration.drawer, ease: motion.ease.out },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: motion.duration.drawer, ease: motion.ease.out },
};

// Stagger children animation
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: motion.duration.card, ease: motion.ease.out },
};

// Skeleton shimmer
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};
