export const getSpeciesIcon = (species: string) => {
  switch (species) {
    case 'DOG':
      return 'fas fa-dog';
    case 'CAT':
      return 'fas fa-cat';
    case 'BIRD':
      return 'fas fa-dove';
    case 'RABBIT':
      return 'fas fa-rabbit';
    default:
      return 'fas fa-paw';
  }
};