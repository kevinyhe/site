for (let i = 0; i < 13; i++) {
    $('.contactHeader').append(`
        <div class="contactRepeat" style="animation: fade-in-top cubic-bezier(0.23, 0.66, 0.19, 0.77) ${0.2 + (0.5 * i)}s;">contact</div>
    `)
}