

const ValidatorDirective = import('../index').then(m => m.ValidatorDirective);
const VldntiControlDirective = import('../index').then(m => m.VldntiControlDirective);

export const vldntiDirectives = [
  ValidatorDirective,
  VldntiControlDirective
];
