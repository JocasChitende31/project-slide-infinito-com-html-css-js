'use strict';

const slideWrapper = document.querySelector('[data-slide="wrapper"]');
const slideList = document.querySelector('[data-slide="list"]');
const navPreviousButton = document.querySelector('[data-slide="nav-previous-button"');
const navNextButton = document.querySelector('[data-slide="nav-next-button"]');
const controlsWrapper = document.querySelector('[data-slide="controls-wrapper"]');
let slideItems = document.querySelectorAll('[data-slide="item"]');
let controlButtons;
let slideInterval

const state = {
    startingPoint: 0,
    savedPosition: 0,
    currentPoint: 0,
    movement: 0,
    currentSlideIndex: 0,
    autoPlay: true,
    timeInterval: 0
}

function translateSlide({ position }) {
    state.savedPosition = position
    slideList.style.transform = `translateX(${position}px)`
}
function getCenterPosition({ index }) {
    const slideItem = slideItems[index]

    const slideWidth = slideItem.clientWidth
    // const windowWidth = document.body.clientWidth
    const position = index * slideWidth
    // const margin = windowWidth-slideWidth /2;
    // const position = margin - (index * slideWidth)
    return position
}
function setVisibleSlide({ index, animate }) {

    if (index === 0 || index === slideItems.length - 1) {
        index = state.currentSlideIndex;
    }

    const position = getCenterPosition({ index })
    // const position = getCenterPosition({ index: index })
    state.currentSlideIndex = index
    slideList.style.transition = animate === true ? 'transform .5s' : 'none'
    activeControlButton({ index })
    translateSlide({ position: - position })
}
function nextSlide() {
    setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true })

}
function previousSlide() {
    setVisibleSlide({ index: state.currentSlideIndex - 1, animate: true })
}

function createControlButtons() {
    slideItems.forEach(function () {
        const controlButton = document.createElement('button')
        controlButton.classList.add('slide-control-button')
        controlButton.classList.add('fa-solid')
        controlButton.classList.add('fa-circle')
        // controlButton.setAttribute('data-slide', 'control-button')
        controlButton.dataset.slide = 'control-button'

        controlsWrapper.append(controlButton);

    })
}
function activeControlButton({ index }) {

    const slideItem = slideItems[index]
    const dataIndex = Number(slideItem.dataset.index)
    const controlButton = controlButtons[dataIndex]

    controlButtons.forEach(function (controlButtonItem) {
        controlButtonItem.classList.remove('active')
    })
    if (controlButton) controlButton.classList.add('active')
}
function createSlideClone() {
    const firstSlide = slideItems[0].cloneNode(true)
    firstSlide.classList.add('slide-cloned')
    firstSlide.dataset.index = slideItems.length

    const secondSlide = slideItems[1].cloneNode(true)
    secondSlide.classList.add('slide-cloned')
    secondSlide.dataset.index = slideItems.length + 1

    const lastSlide = slideItems[slideItems.length - 1].cloneNode(true)
    lastSlide.classList.add('slide-cloned')
    lastSlide.dataset.index = - 1

    const penultimateSlide = slideItems[slideItems.length - 2].cloneNode(true)
    penultimateSlide.classList.add('slide-cloned')
    penultimateSlide.dataset.index = -2


    slideList.append(firstSlide)
    slideList.append(secondSlide)
    slideList.prepend(lastSlide)
    slideList.prepend(penultimateSlide)

    slideItems = document.querySelectorAll('[data-slide="item"]');
}

function onMouseDown(e, index) {
    const slideItem = e.currentTarget
    state.startingPoint = e.clientX;
    state.currentPoint = e.clientX - state.savedPosition
    state.currentSlideIndex = index
    slideList.style.transition = 'none'
    // console.log(state.currentSlideIndex)

    slideItem.addEventListener('mousemove', onMouseMove)
    // console.log("ponto de partida", state.startingPoint);
}
function onMouseMove(e) {
    state.movement = e.clientX - state.startingPoint
    const position = e.clientX - state.currentPoint
    translateSlide({ position })
    // translateSlide({ position: position })
    // console.log("pixel do mousemove", e.clientX, "-", "ponto de partida", startingPoint, " = ", movement)
    // console.log("pixel do mousemove", e.clientX, "-", "ponto actual", currentPoint, " = ", position)

}
function onMouseUp(e) {
    const pointToMove = e.type.includes('touch') ? 40 : 100
    const slideItem = e.currentTarget
    const slideWidth = slideItem.clientWidth

    console.log(slideWidth);

    if (state.movement < -pointToMove) {
        nextSlide()

    } else if (state.movement > pointToMove) {
        previousSlide();
    } else {
        setVisibleSlide({ index: state.currentSlideIndex, animate: true })
    }

    slideItem.removeEventListener('mousemove', onMouseMove)
    console.log("soltei o butão do mouse");
}
function onTouchStart(e, index) {
    e.clientX = e.touches[0].clientX
    onMouseDown(e, index)
    const slideItem = e.currentTarget
    slideItem.addEventListener('touchmove', onTouchMove)
}
function onTouchMove(e) {
    e.clientX = e.touches[0].clientX
    onMouseMove(e)
}

function onTouchEnd(e) {
    onMouseUp(e)
    const slideItem = e.currentTarget
    slideItem.removeEventListener('touchmove', onTouchMove)
}

function prevDefault(e) {
    onMouseUp(e)

}

function onControlButtonClick(index) {

    // activeControlButton({index})
    // setVisibleSlide({index: index});
    setVisibleSlide({ index: index + 2, animate: true });
}

function onSlideListTransitionEnd() {
    const slideItem = slideItems[state.currentSlideIndex]

    if (slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) > 0) {
        setVisibleSlide({ index: 2, animate: false })
    }
    if (slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) < 0) {
        setVisibleSlide({ index: slideItems.length - 3, animate: false })
    }

}
function setAutoPlay() {
    if (state.autoPlay) {
        slideInterval = setInterval(() => {
            setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true });
        }, state.timeInterval)
    }
}

function setListeners() {

    controlButtons = document.querySelectorAll('[data-slide="control-button"]');


    controlButtons.forEach(function (controlButton, index) {

        controlButton.addEventListener('click', function () {
            onControlButtonClick(index)
        })
    })

    slideItems.forEach(function (slideItem, index) {

        slideItem.addEventListener('dragstart', prevDefault)

        slideItem.addEventListener('mousedown', function (e) {
            onMouseDown(e, index);
        })
        slideItem.addEventListener('mouseup', onMouseUp)
        slideItem.addEventListener('touchstart', function (e) {
            onTouchStart(e, index);
        })
        slideItem.addEventListener('touchend', onTouchEnd)

    })

    navNextButton.addEventListener('click', nextSlide)
    navPreviousButton.addEventListener('click', previousSlide)
    slideList.addEventListener('transitionend', onSlideListTransitionEnd)
    slideWrapper.addEventListener('mouseenter', function () {
        clearInterval(slideInterval)
    })
    slideWrapper.addEventListener('mouseleave', function () {
        setAutoPlay()
    })
    let relizeTimeout
    window.addEventListener('resize', function () {
        this.clearTimeout(relizeTimeout)
        this.setTimeout(() => {
            relizeTimeout = setVisibleSlide({ index: state.currentSlideIndex, animate: true })
        }, 1000)
    })

}

function initSlide({ startAtIndex = 0, autoPlay = true, timeInterval = 3000 }) {
    state.autoPlay = autoPlay
    state.timeInterval = timeInterval
    createControlButtons()
    createSlideClone()
    setListeners()
    setVisibleSlide({ index: startAtIndex + 2, animate: true })
    setAutoPlay()
}
