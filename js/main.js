$(document).ready(function () {
    $('.tooltipped').tooltip();
});

$('.expand-on-hover').hover(function () {
    animeTarget = this;
    anime({
        targets: animeTarget,
        translateY: -5,
        scale: 1.1
    });
}, function () {
    animeTarget = this;
    anime({
        targets: animeTarget,
        translateY: 0,
        scale: 1
    });
});

