const PROPS = [
  { id: 'water-pot', src: '/sprites/tea/water-pot.png', alt: 'Water pot' },
  { id: 'leaves', src: '/sprites/tea/tea-leaves.png?v=pottery2', alt: 'Tea leaves' },
  { id: 'pot-big', src: '/sprites/tea/pot-big.png', alt: 'Big teapot' },
  { id: 'pot-small', src: '/sprites/tea/pot-small.png', alt: 'Small teapot' },
  { id: 'spoon', src: '/sprites/tea/spoon.png', alt: 'Tea spoon' },
  { id: 'cup', src: '/sprites/tea/tea-cup.png', alt: 'Tea cup' },
  { id: 'cup-filled', src: '/sprites/tea/tea-cup-filled.png', alt: 'Filled tea cup' },
  { id: 'postcard', src: '/sprites/tea/postcard.png', alt: 'Instruction postcard' },
] as const

export default function TeaGame() {
  return (
    <div className="tea-props" aria-label="Tea tools">
      {PROPS.map((item) => (
        <button key={item.id} type="button" className={`tea-prop tea-prop--${item.id}`}>
          <img src={item.src} alt={item.alt} draggable={false} />
        </button>
      ))}
    </div>
  )
}
