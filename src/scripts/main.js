const appMount = document.getElementById('appMount');

/** some stuff for document loading including the transition
 * @param {string} name
 */
$(document).ready(function () {
    $.blockUI = function () {
        const html = `
            <div class="block-ui">
                <div class="block-ui-content">
                    <svg class="introLogo" viewBox="0 0 915 742" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" overflow="visible">
                        <g class="logoLeft normal">
                            <path d="M0 254.224L235.183 741.057L409.125 654.601L585.127 160.048L493.524 0L313.92 302.598L0 254.224Z"
                                />
                        </g>
                        <g class="logoRight normal">
                            <path d="M687.022 336.049L610.858 212.539L458.529 635.56L833.175 445.149L915 251.651L687.022 336.049Z"
                                />
                        </g>
                    </svg>
                </div>
            </div>
            <style>
                body {
                    background-color: var(--black);
                }
                
                .block-ui {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                
                .introLogo {
                    width: 120px;
                }
                
                .logoLeft {
                    transform: translate(-10%, -300%);
                    animation: logoSlideIn 1.6s cubic-bezier(0.77, -0.1, 0.96, -0.05) forwards;
                }
                
                .logoRight {
                    transform: translate(10%, 300%);
                    animation: logoSlideIn 1.6s cubic-bezier(0.77, -0.1, 0.96, -0.05) forwards;
                }
                
                @keyframes logoSlideIn {
                    0% {
                        filter: blur(30px);
                        opacity: 0;
                    }
                
                    30% {
                        opacity: 0.1
                    }
                
                    100% {
                        opacity: 1;
                        transform: translate(0%, 0%);
                        filter: blur(0) drop-shadow(0 0 400px #fff);
                    }
                }
            </style>
        `;
        $('body').append(html);
    };
    $.changeUI = async function () {
        const introLogo = $('.introLogo')
        introLogo.fadeOut(600);

        setTimeout($.unblockUI, 600);
    };
    $.unblockUI = function () {
        // remove the block from the DOM
        // then update the body css to change the background colour
        $('.block-ui').remove();
        $('body').css('background-color', 'transparent');
        appMount.classList.remove('hidden');
    };
    $.blockUI();
    $(window).on('load', function () {
        setTimeout($.changeUI, 1400);
    });
});

/**
 * an async sleep function
 * @param {*} ms delay in milliseconds
 * @returns
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
