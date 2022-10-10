const cursor = document.getElementById('cursor');

$(document).on('mousemove', function (e) {
    cursor.classList.remove('hidden');
    const mouseY = e.clientY;
    const mouseX = e.clientX;

    $('#cursor').css('transform', `translate3d(${mouseX - 10}px, ${mouseY - 10}px, 0)`);
});

function blurWindow () {
    $('#cursor').css('opacity', `0`);
    $('#appMount').css('filter', `blur(4px)`);
}

function unBlurWindow () {
    $('#cursor').css('opacity', `1`);
    $('#appMount').css('filter', `blur(0px)`);
}

$(window).on('focus', unBlurWindow);
$(window).on('blur', blurWindow);

$(document).mouseleave(blurWindow);
$(document).mouseenter(unBlurWindow);
