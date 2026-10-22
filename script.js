
document.addEventListener("DOMContentLoaded", function () {
    const orderForm = document.getElementById("order-form");
    const quantityInput = document.getElementById("quantity");
    const quantityError = document.getElementById("quantity-error");
    const optionField = document.getElementById("option-field");
    const optionSelect = document.getElementById("option");
    const propertyField = document.getElementById("property-field");
    const propertyCheckbox = document.getElementById("property");
    const resultText = document.getElementById("result-text");

    const galleryTrack = document.getElementById("gallery-track");
    const gallerySlides = Array.from(
        galleryTrack.querySelectorAll(".gallery-slide")
    );
    const previousButton = document.getElementById("gallery-prev");
    const nextButton = document.getElementById("gallery-next");
    const pager = document.getElementById("gallery-pager");

    const quantityPattern = /^[1-9]\d*$/;

    let currentPage = 0;
    let slidesPerPage = getSlidesPerPage();
    let pageCount = getPageCount();

    /* Логика калькулятора */

    function getSelectedProduct() {
        return orderForm.querySelector("input[name='product']:checked");
    }

    function getPrice(element) {
        return parseInt(element.getAttribute("data-price"), 10);
    }

    function showError(message) {
        quantityError.textContent = message;
        quantityError.hidden = false;
        quantityInput.setAttribute("aria-invalid", "true");
        resultText.textContent = "Стоимость: —";
    }

    function clearError() {
        quantityError.textContent = "";
        quantityError.hidden = true;
        quantityInput.removeAttribute("aria-invalid");
    }

    function updateFieldsVisibility(productType) {
        optionField.hidden = productType !== "notebook";
        propertyField.hidden = productType !== "folder";

        if (productType !== "folder") {
            propertyCheckbox.checked = false;
        }
    }

    function calculate() {
        const product = getSelectedProduct();
        const quantityValue = quantityInput.value.trim();
        let unitPrice = getPrice(product);
        let quantity = 0;
        let total = 0;

        updateFieldsVisibility(product.value);

        if (!quantityPattern.test(quantityValue)) {
            showError("Ошибка: введите целое положительное число.");
            return;
        }

        quantity = parseInt(quantityValue, 10);

        if (!Number.isSafeInteger(quantity)) {
            showError("Ошибка: введённое количество слишком велико.");
            return;
        }

        if (product.value === "notebook") {
            unitPrice += getPrice(
                optionSelect.options[optionSelect.selectedIndex]
            );
        }

        if (product.value === "folder" && propertyCheckbox.checked) {
            unitPrice += getPrice(propertyCheckbox);
        }

        total = unitPrice * quantity;

        if (!Number.isSafeInteger(total)) {
            showError("Ошибка: стоимость заказа слишком велика.");
            return;
        }

        clearError();

        resultText.textContent = "Стоимость: " +
            unitPrice.toLocaleString("ru-RU") + " ₽ × " +
            quantity.toLocaleString("ru-RU") + " = " +
            total.toLocaleString("ru-RU") + " ₽";
    }

    /* Логика галереи */

    function getSlidesPerPage() {
        return window.matchMedia("(max-width: 767px)").matches ? 1 : 3;
    }

    function getPageCount() {
        return Math.ceil(gallerySlides.length / slidesPerPage);
    }

    function updateGallery() {
        const firstSlide = gallerySlides[0];
        const trackStyles = window.getComputedStyle(galleryTrack);
        const gap = parseFloat(trackStyles.columnGap) || 0;
        const slideWidth = firstSlide.getBoundingClientRect().width;
        const offset = currentPage * slidesPerPage * (slideWidth + gap);

        galleryTrack.style.transform = "translateX(-" + offset + "px)";
        pager.textContent = "Страница " + (currentPage + 1) +
            " из " + pageCount;

        previousButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage >= pageCount - 1;
    }

    function changePage(direction) {
        const newPage = currentPage + direction;

        if (newPage < 0 || newPage >= pageCount) {
            return;
        }

        currentPage = newPage;
        updateGallery();
    }

    /* Обработчики событий калькулятора */

    orderForm.addEventListener("submit", function (event) {
        event.preventDefault();
    });

    quantityInput.addEventListener("input", calculate);
    optionSelect.addEventListener("change", calculate);
    propertyCheckbox.addEventListener("change", calculate);

    orderForm.querySelectorAll("input[name='product']").forEach(
        function (radio) {
            radio.addEventListener("change", calculate);
        }
    );

    /* Обработчики событий галереи */

    previousButton.addEventListener("click", function () {
        changePage(-1);
    });

    nextButton.addEventListener("click", function () {
        changePage(1);
    });

    window.addEventListener("resize", function () {
        const newSlidesPerPage = getSlidesPerPage();

        if (newSlidesPerPage !== slidesPerPage) {
            slidesPerPage = newSlidesPerPage;
            pageCount = getPageCount();
            currentPage = 0;
        }

        updateGallery();
    });

    window.addEventListener("load", updateGallery);

    gallerySlides.forEach(function (slide) {
        const image = slide.querySelector("img");
        image.addEventListener("load", updateGallery);
    });

    /* Первоначальная настройка */

    calculate();
    updateGallery();
});
