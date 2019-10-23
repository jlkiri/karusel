const SMOOTHNG_THRESHOLD = 1;
const NUM_BLANK_SLIDES_RIGHT = 1;
const SLIDES_PER_SCREEN = 3;

const initCarousel = function initCarousel(root, children) {
  const wrapper = document.createElement('div');

  wrapper.append(...children);
  wrapper.classList.add('wrapper');

  root.appendChild(wrapper);

  const childWidth = children[0].getBoundingClientRect().width;

  let isMouseDown = false;
  let referenceX = 0; // スクロール開始時にreferenceとするXの値を保存する用
  let prevDelta = 0; // 前回スクロール時のX軸の差分を保存する用

  root.addEventListener('mousedown', e => {
    isMouseDown = true;
    referenceX = e.clientX;
    wrapper.classList.add('dragging');
  });

  const balancePosition = () => {
    const currDelta = wrapper.getBoundingClientRect().left;
    const rightBound =
      (children.length - (SLIDES_PER_SCREEN - NUM_BLANK_SLIDES_RIGHT)) *
      childWidth;

    const isLeftOverflow = delta => delta > 0;
    const isRightOverflow = delta => -delta > rightBound;

    // 1まで丸める Math.round(x)
    // 10まで丸める Math.round(x * 0.1) / 0.1
    // 100まで丸める Math.round(x * 0.01) / 0.01
    // 以上のようにスクロールが止まった位置を丸めることで慣性ができる

    // デフォルトを0.01にしているため、100pxごとに丸めていることになる（120px->100px, 156px->200px)
    // 一枚の幅が異なる場合、100pxに割ることで正しい丸め値ができる。例：200pxの場合 200/100 = 2なのでbaseを2で割る)
    // 一枚の途中でスクロール止めてもいいようにしたい場合は、THRESHOLDを調整する（デフォルトが１）
    // 2倍にすると一枚の真ん中で止めていいということにできる、3倍にすると止められる位置が三つになるなどなど

    const base = 0.01;
    const smoothingFactor = (base / (childWidth * 0.01)) * SMOOTHNG_THRESHOLD;

    const roundedX = isLeftOverflow(currDelta)
      ? 0
      : isRightOverflow(currDelta)
      ? -rightBound
      : Math.round(smoothingFactor * currDelta) / smoothingFactor;

    wrapper.classList.remove('dragging');

    requestAnimationFrame(() => {
      wrapper.style.transform = `translateX(${roundedX}px)`;
    });

    prevDelta = roundedX;
  };

  root.addEventListener('mouseup', e => {
    isMouseDown = false;

    balancePosition();
  });

  root.addEventListener('mouseleave', () => {
    isMouseDown = false;

    balancePosition();
  });

  root.addEventListener('mousemove', e => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - referenceX;

    requestAnimationFrame(() => {
      wrapper.style.transform = `translateX(${prevDelta + deltaX}px)`;
    });
  });
};

export default initCarousel;
