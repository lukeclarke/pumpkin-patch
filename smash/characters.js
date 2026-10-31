/*
  The deck.

  To use real pictures: drop them in smash/characters/ (jpg, png or webp,
  portrait around 3:4 looks best, they get cropped to fill the card) and
  change the img paths below. Or just overwrite 01.jpg ... 12.jpg and lav.jpg.

  traits are 0-10 and feed the "your type" chart on the results screen.
  Add or remove entries freely, the game counts them itself.
  LAV_CARD is always the last card.
*/

window.CHARACTERS = [
  { img: "characters/01.jpg", traits: { danger: 10, charm: 2, mystery: 7, brains: 3, brawn: 9, chaos: 7, toxic: 9, loyal: 6, dramatic: 3, clingy: 8, mysterious: 9, fun: 1 } }, // hockey mask
  { img: "characters/02.jpg", traits: { danger: 7, charm: 10, mystery: 8, brains: 8, brawn: 5, chaos: 4, toxic: 8, loyal: 7, dramatic: 10, clingy: 7, mysterious: 8, fun: 5 } }, // vampire
  { img: "characters/03.jpg", traits: { danger: 6, charm: 7, mystery: 9, brains: 10, brawn: 2, chaos: 7, toxic: 5, loyal: 6, dramatic: 7, clingy: 3, mysterious: 8, fun: 7 } }, // witch
  { img: "characters/04.jpg", traits: { danger: 8, charm: 6, mystery: 4, brains: 5, brawn: 4, chaos: 10, toxic: 8, loyal: 3, dramatic: 8, clingy: 6, mysterious: 3, fun: 10 } }, // clown
  { img: "characters/05.jpg", traits: { danger: 5, charm: 3, mystery: 8, brains: 4, brawn: 7, chaos: 3, toxic: 4, loyal: 10, dramatic: 5, clingy: 9, mysterious: 7, fun: 2 } }, // mummy
  { img: "characters/06.jpg", traits: { danger: 8, charm: 6, mystery: 6, brains: 3, brawn: 10, chaos: 8, toxic: 6, loyal: 9, dramatic: 6, clingy: 5, mysterious: 6, fun: 6 } }, // werewolf
  { img: "characters/07.jpg", traits: { danger: 2, charm: 7, mystery: 9, brains: 5, brawn: 0, chaos: 4, toxic: 3, loyal: 9, dramatic: 7, clingy: 10, mysterious: 9, fun: 6 } }, // ghost
  { img: "characters/08.jpg", traits: { danger: 5, charm: 4, mystery: 3, brains: 2, brawn: 10, chaos: 5, toxic: 2, loyal: 10, dramatic: 6, clingy: 7, mysterious: 2, fun: 5 } }, // monster
  { img: "characters/09.jpg", traits: { danger: 3, charm: 6, mystery: 5, brains: 4, brawn: 1, chaos: 6, toxic: 2, loyal: 6, dramatic: 4, clingy: 2, mysterious: 5, fun: 9 } }, // skeleton
  { img: "characters/10.jpg", traits: { danger: 6, charm: 8, mystery: 6, brains: 5, brawn: 5, chaos: 7, toxic: 4, loyal: 7, dramatic: 6, clingy: 4, mysterious: 6, fun: 9 } }, // pumpkin head
  { img: "characters/11.jpg", traits: { danger: 7, charm: 1, mystery: 2, brains: 0, brawn: 6, chaos: 9, toxic: 6, loyal: 8, dramatic: 2, clingy: 10, mysterious: 1, fun: 4 } }, // zombie
  { img: "characters/12.jpg", traits: { danger: 10, charm: 9, mystery: 8, brains: 8, brawn: 7, chaos: 9, toxic: 10, loyal: 2, dramatic: 9, clingy: 3, mysterious: 8, fun: 7 } }, // demon
];

window.LAV_CARD = { img: "characters/lav.jpg" };
