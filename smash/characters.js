/*
  The deck.

  To use real pictures: drop them in smash/characters/ (jpg, png or webp,
  portrait around 3:4 looks best, they get cropped to fill the card) and
  change the img paths below. Overwrite lav.jpg for the last card.

  traits are 0-10 and feed the "your type" chart on the results screen.
  Add or remove entries freely, the game counts them itself.
  LAV_CARD is always the last card.
*/

window.CHARACTERS = [
  { img: "characters/trapper.jpg", traits: { danger: 9, charm: 1, mystery: 3, brains: 3, brawn: 10, chaos: 5, toxic: 8, loyal: 4, dramatic: 2, clingy: 6, mysterious: 3, fun: 1 } },
  { img: "characters/wraith.jpg", traits: { danger: 7, charm: 1, mystery: 9, brains: 3, brawn: 5, chaos: 4, toxic: 6, loyal: 3, dramatic: 3, clingy: 5, mysterious: 9, fun: 2 } },
  { img: "characters/hillbilly.jpg", traits: { danger: 9, charm: 2, mystery: 2, brains: 1, brawn: 8, chaos: 10, toxic: 7, loyal: 3, dramatic: 6, clingy: 4, mysterious: 1, fun: 6 } },
  { img: "characters/nurse.jpg", traits: { danger: 8, charm: 2, mystery: 9, brains: 5, brawn: 3, chaos: 6, toxic: 7, loyal: 5, dramatic: 6, clingy: 8, mysterious: 9, fun: 1 } },
  { img: "characters/huntress.jpg", traits: { danger: 8, charm: 4, mystery: 5, brains: 4, brawn: 9, chaos: 4, toxic: 6, loyal: 9, dramatic: 3, clingy: 7, mysterious: 6, fun: 4 } },
  { img: "characters/shape.jpg", traits: { danger: 10, charm: 1, mystery: 10, brains: 4, brawn: 8, chaos: 3, toxic: 9, loyal: 6, dramatic: 1, clingy: 10, mysterious: 10, fun: 0 } },
  { img: "characters/hag.jpg", traits: { danger: 7, charm: 0, mystery: 8, brains: 6, brawn: 2, chaos: 6, toxic: 8, loyal: 3, dramatic: 5, clingy: 6, mysterious: 8, fun: 2 } },
  { img: "characters/doctor.jpg", traits: { danger: 8, charm: 1, mystery: 4, brains: 9, brawn: 6, chaos: 9, toxic: 9, loyal: 2, dramatic: 7, clingy: 5, mysterious: 3, fun: 5 } },
  { img: "characters/cannibal.jpg", traits: { danger: 9, charm: 2, mystery: 2, brains: 1, brawn: 9, chaos: 10, toxic: 6, loyal: 9, dramatic: 5, clingy: 6, mysterious: 2, fun: 6 } },
  { img: "characters/nightmare.jpg", traits: { danger: 9, charm: 6, mystery: 5, brains: 7, brawn: 3, chaos: 9, toxic: 10, loyal: 1, dramatic: 9, clingy: 4, mysterious: 4, fun: 9 } },
  { img: "characters/pig.jpg", traits: { danger: 7, charm: 4, mystery: 8, brains: 8, brawn: 4, chaos: 4, toxic: 7, loyal: 8, dramatic: 4, clingy: 5, mysterious: 8, fun: 2 } },
  { img: "characters/clown.jpg", traits: { danger: 7, charm: 2, mystery: 2, brains: 4, brawn: 5, chaos: 8, toxic: 9, loyal: 2, dramatic: 6, clingy: 4, mysterious: 1, fun: 6 } },
  { img: "characters/spirit.jpg", traits: { danger: 8, charm: 5, mystery: 9, brains: 4, brawn: 3, chaos: 6, toxic: 8, loyal: 6, dramatic: 8, clingy: 8, mysterious: 9, fun: 1 } },
  { img: "characters/legion.jpg", traits: { danger: 6, charm: 7, mystery: 4, brains: 3, brawn: 5, chaos: 10, toxic: 8, loyal: 9, dramatic: 6, clingy: 5, mysterious: 4, fun: 10 } },
  { img: "characters/plague.jpg", traits: { danger: 7, charm: 6, mystery: 8, brains: 6, brawn: 3, chaos: 6, toxic: 7, loyal: 7, dramatic: 9, clingy: 5, mysterious: 8, fun: 3 } },
  { img: "characters/ghost-face.jpg", traits: { danger: 8, charm: 8, mystery: 8, brains: 7, brawn: 4, chaos: 6, toxic: 8, loyal: 3, dramatic: 9, clingy: 9, mysterious: 7, fun: 8 } },
  { img: "characters/demogorgon.jpg", traits: { danger: 9, charm: 0, mystery: 9, brains: 1, brawn: 9, chaos: 8, toxic: 6, loyal: 2, dramatic: 2, clingy: 4, mysterious: 9, fun: 1 } },
  { img: "characters/oni.jpg", traits: { danger: 10, charm: 3, mystery: 4, brains: 4, brawn: 10, chaos: 8, toxic: 8, loyal: 6, dramatic: 9, clingy: 4, mysterious: 4, fun: 4 } },
  { img: "characters/deathslinger.jpg", traits: { danger: 7, charm: 7, mystery: 5, brains: 6, brawn: 6, chaos: 5, toxic: 6, loyal: 6, dramatic: 6, clingy: 7, mysterious: 5, fun: 6 } },
  { img: "characters/executioner.jpg", traits: { danger: 10, charm: 0, mystery: 10, brains: 4, brawn: 10, chaos: 3, toxic: 9, loyal: 5, dramatic: 4, clingy: 8, mysterious: 10, fun: 0 } },
  { img: "characters/blight.jpg", traits: { danger: 7, charm: 3, mystery: 4, brains: 10, brawn: 3, chaos: 10, toxic: 7, loyal: 2, dramatic: 8, clingy: 3, mysterious: 4, fun: 7 } },
  { img: "characters/twins.jpg", traits: { danger: 7, charm: 4, mystery: 6, brains: 5, brawn: 5, chaos: 8, toxic: 8, loyal: 10, dramatic: 7, clingy: 10, mysterious: 6, fun: 5 } },
  { img: "characters/trickster.jpg", traits: { danger: 7, charm: 9, mystery: 3, brains: 5, brawn: 4, chaos: 9, toxic: 9, loyal: 1, dramatic: 10, clingy: 6, mysterious: 2, fun: 10 } },
  { img: "characters/nemesis.jpg", traits: { danger: 9, charm: 0, mystery: 3, brains: 2, brawn: 10, chaos: 6, toxic: 5, loyal: 8, dramatic: 3, clingy: 10, mysterious: 4, fun: 1 } },
  { img: "characters/cenobite.jpg", traits: { danger: 9, charm: 8, mystery: 10, brains: 10, brawn: 3, chaos: 6, toxic: 10, loyal: 3, dramatic: 9, clingy: 6, mysterious: 10, fun: 2 } },
  { img: "characters/artist.jpg", traits: { danger: 7, charm: 7, mystery: 8, brains: 7, brawn: 3, chaos: 6, toxic: 7, loyal: 5, dramatic: 8, clingy: 6, mysterious: 8, fun: 3 } },
  { img: "characters/onryo.jpg", traits: { danger: 8, charm: 2, mystery: 10, brains: 4, brawn: 2, chaos: 5, toxic: 8, loyal: 4, dramatic: 6, clingy: 9, mysterious: 10, fun: 0 } },
  { img: "characters/dredge.jpg", traits: { danger: 8, charm: 0, mystery: 10, brains: 3, brawn: 6, chaos: 7, toxic: 7, loyal: 3, dramatic: 3, clingy: 6, mysterious: 10, fun: 0 } },
  { img: "characters/mastermind.jpg", traits: { danger: 9, charm: 9, mystery: 6, brains: 10, brawn: 8, chaos: 6, toxic: 10, loyal: 1, dramatic: 10, clingy: 4, mysterious: 6, fun: 4 } },
  { img: "characters/knight.jpg", traits: { danger: 8, charm: 4, mystery: 6, brains: 7, brawn: 9, chaos: 4, toxic: 7, loyal: 7, dramatic: 7, clingy: 4, mysterious: 6, fun: 2 } },
  { img: "characters/skull-merchant.jpg", traits: { danger: 8, charm: 5, mystery: 6, brains: 9, brawn: 4, chaos: 4, toxic: 8, loyal: 2, dramatic: 5, clingy: 7, mysterious: 6, fun: 3 } },
  { img: "characters/singularity.jpg", traits: { danger: 7, charm: 1, mystery: 7, brains: 9, brawn: 4, chaos: 6, toxic: 6, loyal: 3, dramatic: 3, clingy: 8, mysterious: 7, fun: 2 } },
  { img: "characters/xenomorph.jpg", traits: { danger: 10, charm: 1, mystery: 9, brains: 5, brawn: 8, chaos: 7, toxic: 8, loyal: 4, dramatic: 2, clingy: 6, mysterious: 9, fun: 1 } },
  { img: "characters/good-guy.jpg", traits: { danger: 7, charm: 8, mystery: 2, brains: 5, brawn: 1, chaos: 10, toxic: 10, loyal: 6, dramatic: 8, clingy: 9, mysterious: 2, fun: 10 } },
  { img: "characters/unknown.jpg", traits: { danger: 7, charm: 1, mystery: 10, brains: 2, brawn: 6, chaos: 9, toxic: 7, loyal: 2, dramatic: 4, clingy: 6, mysterious: 10, fun: 3 } },
  { img: "characters/lich.jpg", traits: { danger: 8, charm: 6, mystery: 7, brains: 10, brawn: 2, chaos: 6, toxic: 8, loyal: 3, dramatic: 9, clingy: 4, mysterious: 7, fun: 4 } },
  { img: "characters/dark-lord.jpg", traits: { danger: 9, charm: 10, mystery: 7, brains: 8, brawn: 6, chaos: 5, toxic: 10, loyal: 4, dramatic: 10, clingy: 7, mysterious: 7, fun: 5 } },
  { img: "characters/houndmaster.jpg", traits: { danger: 8, charm: 6, mystery: 4, brains: 6, brawn: 6, chaos: 5, toxic: 7, loyal: 10, dramatic: 6, clingy: 5, mysterious: 4, fun: 6 } },
  { img: "characters/art-the-clown.jpg", traits: { danger: 10, charm: 6, mystery: 4, brains: 5, brawn: 7, chaos: 10, toxic: 10, loyal: 1, dramatic: 10, clingy: 5, mysterious: 4, fun: 10 } },
  { img: "characters/jason.jpg", traits: { danger: 10, charm: 2, mystery: 7, brains: 2, brawn: 10, chaos: 6, toxic: 7, loyal: 9, dramatic: 2, clingy: 10, mysterious: 9, fun: 1 } },
  { img: "characters/ghostface-scream.jpg", traits: { danger: 8, charm: 9, mystery: 9, brains: 8, brawn: 4, chaos: 7, toxic: 9, loyal: 4, dramatic: 10, clingy: 9, mysterious: 8, fun: 8 } }
];

window.LAV_CARD = { img: "characters/lav.jpg" };
