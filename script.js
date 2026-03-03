// Текущий выбранный тип фигуры
let currentShape = null;
let calculationHistory = JSON.parse(localStorage.getItem('areaHistory')) || [];

// Коэффициенты конвертации для разных единиц измерения (все относительно м²)
const unitConversionRates = {
    'mm²': 0.000001,      // 1 мм² = 0.000001 м²
    'cm²': 0.0001,        // 1 см² = 0.0001 м²
    'dm²': 0.01,          // 1 дм² = 0.01 м²
    'm²': 1,              // 1 м² = 1 м²
    'km²': 1000000,       // 1 км² = 1,000,000 м²
    'ar': 100,            // 1 ар (сотка) = 100 м²
    'hectare': 10000      // 1 гектар = 10,000 м²
};

// Названия единиц для отображения
const unitDisplayNames = {
    'mm²': 'мм²',
    'cm²': 'см²',
    'dm²': 'дм²',
    'm²': 'м²',
    'km²': 'км²',
    'ar': 'ар (сотка)',
    'hectare': 'га'
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Калькулятор площадей загружен!');
    initializeShapeCards();
    setupEventListeners();
    loadHistory();
    setupThemeToggle();
    setupUnitConverter();
    initializeTooltips();
});

// Настройка карточек фигур
function initializeShapeCards() {
    const shapeCards = document.querySelectorAll('.shape-card');
    shapeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Удаляем активный класс у всех карточек
            shapeCards.forEach(c => c.classList.remove('active'));
            // Добавляем активный класс текущей
            this.classList.add('active');
            // Получаем тип фигуры
            const shapeType = this.dataset.shape;
            currentShape = shapeType;
            // Показываем соответствующие поля ввода
            showInputFields(shapeType);
        });
    });
}

// Показать поля ввода для выбранной фигуры
function showInputFields(shapeType) {
    const inputContainer = document.getElementById('shape-inputs');
    let html = '';
    
    switch(shapeType) {
        // Существующие фигуры
        case 'square':
            html = `
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Сторона квадрата (a)</label>
                    <input type="number" id="square-side" class="shape-input" placeholder="Введите длину стороны" step="0.01" min="0">
                    <small class="input-hint">S = a²</small>
                </div>
            `;
            break;
            
        case 'rectangle':
            html = `
                <div class="input-group">
                    <label><i class="fas fa-ruler-horizontal"></i> Длина (a)</label>
                    <input type="number" id="rect-length" class="shape-input" placeholder="Введите длину" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler-vertical"></i> Ширина (b)</label>
                    <input type="number" id="rect-width" class="shape-input" placeholder="Введите ширину" step="0.01" min="0">
                </div>
                <small class="input-hint">S = a × b</small>
            `;
            break;
            
case 'triangle':
    html = `
        <div class="input-group">
            <label><i class="fas fa-gem"></i> Способ 1: Основание и высота</label>
        </div>
        <div class="input-group">
            <label><i class="fas fa-ruler"></i> Основание (a)</label>
            <input type="number" id="tri-base" class="shape-input" placeholder="Введите основание" step="0.01" min="0">
        </div>
        <div class="input-group">
            <label><i class="fas fa-mountain"></i> Высота (h)</label>
            <input type="number" id="tri-height" class="shape-input" placeholder="Введите высоту" step="0.01" min="0">
        </div>
        
        <div class="input-divider">- ИЛИ -</div>
        
        <div class="input-group">
            <label><i class="fas fa-gem"></i> Способ 2: Три стороны (формула Герона)</label>
        </div>
        <div class="input-group">
            <label><i class="fas fa-ruler"></i> Сторона a</label>
            <input type="number" id="tri-side-a" class="shape-input" placeholder="Введите сторону a" step="0.01" min="0">
        </div>
        <div class="input-group">
            <label><i class="fas fa-ruler"></i> Сторона b</label>
            <input type="number" id="tri-side-b" class="shape-input" placeholder="Введите сторону b" step="0.01" min="0">
        </div>
        <div class="input-group">
            <label><i class="fas fa-ruler"></i> Сторона c</label>
            <input type="number" id="tri-side-c" class="shape-input" placeholder="Введите сторону c" step="0.01" min="0">
        </div>
        
        <div class="input-divider">- ИЛИ -</div>
        
        <div class="input-group">
            <label><i class="fas fa-gem"></i> Способ 3: По радиусу вписанной окружности</label>
        </div>
        <div class="input-group">
            <label><i class="fas fa-circle"></i> Радиус вписанной окружности (r)</label>
            <input type="number" id="tri-inscribed-radius" class="shape-input" placeholder="Введите радиус" step="0.01" min="0">
        </div>
        <div class="input-group">
            <label><i class="fas fa-ruler"></i> Полупериметр (p)</label>
            <input type="number" id="tri-semiperimeter" class="shape-input" placeholder="Введите полупериметр" step="0.01" min="0">
            <small class="input-hint">p = (a + b + c) / 2</small>
        </div>
        
        <div class="input-divider">- ИЛИ -</div>
        
        <div class="input-group">
            <label><i class="fas fa-gem"></i> Способ 4: Равносторонний треугольник</label>
        </div>
        <div class="input-group">
            <label><i class="fas fa-ruler"></i> Сторона равностороннего (a)</label>
            <input type="number" id="tri-equilateral-side" class="shape-input" placeholder="Введите сторону" step="0.01" min="0">
            <small class="input-hint">S = (a² × √3) / 4</small>
        </div>
    `;
    break;
            
        case 'circle':
            html = `
                <div class="input-group">
                    <label><i class="fas fa-circle-notch"></i> Радиус (r)</label>
                    <input type="number" id="circle-radius" class="shape-input" placeholder="Введите радиус" step="0.01" min="0">
                </div>
                <small class="input-hint">S = π × r²</small>
            `;
            break;
            
        case 'trapezoid':
            html = `
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Основание a</label>
                    <input type="number" id="trap-base-a" class="shape-input" placeholder="Введите основание a" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Основание b</label>
                    <input type="number" id="trap-base-b" class="shape-input" placeholder="Введите основание b" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-mountain"></i> Высота (h)</label>
                    <input type="number" id="trap-height" class="shape-input" placeholder="Введите высоту" step="0.01" min="0">
                </div>
                <small class="input-hint">S = ½ × (a + b) × h</small>
            `;
            break;
            
        case 'ellipse':
            html = `
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Большая полуось (a)</label>
                    <input type="number" id="ellipse-major" class="shape-input" placeholder="Введите большую полуось" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Малая полуось (b)</label>
                    <input type="number" id="ellipse-minor" class="shape-input" placeholder="Введите малую полуось" step="0.01" min="0">
                </div>
                <small class="input-hint">S = π × a × b</small>
            `;
            break;
            
        // НОВЫЕ ФИГУРЫ
        case 'rhombus':
            html = `
                <div class="input-group">
                    <label><i class="fas fa-gem"></i> Способ 1: Через диагонали</label>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Диагональ d₁</label>
                    <input type="number" id="rhombus-diag1" class="shape-input" placeholder="Введите первую диагональ" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Диагональ d₂</label>
                    <input type="number" id="rhombus-diag2" class="shape-input" placeholder="Введите вторую диагональ" step="0.01" min="0">
                </div>
                <div class="input-divider">- ИЛИ -</div>
                <div class="input-group">
                    <label><i class="fas fa-gem"></i> Способ 2: Через сторону и высоту</label>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Сторона (a)</label>
                    <input type="number" id="rhombus-side" class="shape-input" placeholder="Введите сторону" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-mountain"></i> Высота (h)</label>
                    <input type="number" id="rhombus-height" class="shape-input" placeholder="Введите высоту" step="0.01" min="0">
                </div>
                <small class="input-hint">S = (d₁ × d₂) ÷ 2  или  S = a × h</small>
            `;
            break;
            
        case 'parallelogram':
            html = `
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Основание (a)</label>
                    <input type="number" id="parallelogram-base" class="shape-input" placeholder="Введите основание" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-mountain"></i> Высота (h)</label>
                    <input type="number" id="parallelogram-height" class="shape-input" placeholder="Введите высоту" step="0.01" min="0">
                </div>
                <div class="input-divider">- ИЛИ -</div>
                <div class="input-group">
                    <label><i class="fas fa-gem"></i> Через стороны и угол</label>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Сторона a</label>
                    <input type="number" id="parallelogram-side-a" class="shape-input" placeholder="Введите сторону a" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-ruler"></i> Сторона b</label>
                    <input type="number" id="parallelogram-side-b" class="shape-input" placeholder="Введите сторону b" step="0.01" min="0">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-angle-double-right"></i> Угол α (градусы)</label>
                    <input type="number" id="parallelogram-angle" class="shape-input" placeholder="Введите угол в градусах" step="0.1" min="0" max="180">
                </div>
                <small class="input-hint">S = a × h  или  S = a × b × sin(α)</small>
            `;
            break;
            
        default:
            html = `
                <div class="default-message">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Выберите фигуру для расчета</p>
                </div>
            `;
    }
    
    inputContainer.innerHTML = html;
}

// Расчет площади
function calculateArea() {
    if (!currentShape) {
        alert('Пожалуйста, выберите фигуру!');
        return;
    }
    
    const unit = document.getElementById('unit').value;
    let areaInSelectedUnit = 0;
    let formula = '';
    let steps = '';
    let parameters = {};
    
    try {
        switch(currentShape) {
            // Существующие фигуры
            case 'square':
                const side = parseFloat(document.getElementById('square-side')?.value);
                if (!side || side <= 0) throw new Error('Введите положительное значение стороны');
                areaInSelectedUnit = side * side;
                formula = 'S = a²';
                steps = `S = ${side}² = ${areaInSelectedUnit.toFixed(4)}`;
                parameters = { side };
                break;
                
            case 'rectangle':
                const length = parseFloat(document.getElementById('rect-length')?.value);
                const width = parseFloat(document.getElementById('rect-width')?.value);
                if (!length || !width || length <= 0 || width <= 0) 
                    throw new Error('Введите положительные значения длины и ширины');
                areaInSelectedUnit = length * width;
                formula = 'S = a × b';
                steps = `S = ${length} × ${width} = ${areaInSelectedUnit.toFixed(4)}`;
                parameters = { length, width };
                break;
                
            case 'triangle':
    // Проверяем различные способы расчета
    
    // Способ 1: Основание и высота
    const base = parseFloat(document.getElementById('tri-base')?.value);
    const height = parseFloat(document.getElementById('tri-height')?.value);
    
    // Способ 2: Три стороны (формула Герона)
    const sideA = parseFloat(document.getElementById('tri-side-a')?.value);
    const sideB = parseFloat(document.getElementById('tri-side-b')?.value);
    const sideC = parseFloat(document.getElementById('tri-side-c')?.value);
    
    // Способ 3: По радиусу вписанной окружности
    const inscribedRadius = parseFloat(document.getElementById('tri-inscribed-radius')?.value);
    const semiperimeter = parseFloat(document.getElementById('tri-semiperimeter')?.value);
    
    // Способ 4: Равносторонний треугольник
    const equilateralSide = parseFloat(document.getElementById('tri-equilateral-side')?.value);
    
    // Способ 5: По радиусу описанной окружности (равносторонний)
    const circumRadius = parseFloat(document.getElementById('tri-circum-radius')?.value);
    
    // Способ 6: По радиусу вписанной окружности (равносторонний)
    const equilateralInscribed = parseFloat(document.getElementById('tri-equilateral-inscribed')?.value);
    
    // Способ 7: Две стороны и угол
    const sideAngleA = parseFloat(document.getElementById('tri-side-angle-a')?.value);
    const sideAngleB = parseFloat(document.getElementById('tri-side-angle-b')?.value);
    const angle = parseFloat(document.getElementById('tri-angle')?.value);
    
    // Определяем какой способ использован
    if (base && height && base > 0 && height > 0) {
        // Способ 1: Основание и высота
        areaInSelectedUnit = 0.5 * base * height;
        formula = 'S = ½ × a × h';
        steps = `S = ½ × ${base} × ${height} = ${areaInSelectedUnit.toFixed(4)}`;
        parameters = { base, height };
    }
    else if (sideA && sideB && sideC && sideA > 0 && sideB > 0 && sideC > 0) {
        // Способ 2: Формула Герона
        // Проверяем неравенство треугольника
        if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) {
            throw new Error('Треугольник с такими сторонами не существует (нарушено неравенство треугольника)');
        }
        
        const p = (sideA + sideB + sideC) / 2; // полупериметр
        areaInSelectedUnit = Math.sqrt(p * (p - sideA) * (p - sideB) * (p - sideC));
        formula = 'S = √(p(p-a)(p-b)(p-c)) (формула Герона)';
        steps = `p = (${sideA} + ${sideB} + ${sideC})/2 = ${p.toFixed(4)}\n`;
        steps += `S = √(${p.toFixed(4)} × ${(p - sideA).toFixed(4)} × ${(p - sideB).toFixed(4)} × ${(p - sideC).toFixed(4)}) = ${areaInSelectedUnit.toFixed(4)}`;
        parameters = { sideA, sideB, sideC };
    }
    else if (inscribedRadius && semiperimeter && inscribedRadius > 0 && semiperimeter > 0) {
        // Способ 3: По радиусу вписанной окружности
        areaInSelectedUnit = inscribedRadius * semiperimeter;
        formula = 'S = r × p';
        steps = `S = ${inscribedRadius} × ${semiperimeter} = ${areaInSelectedUnit.toFixed(4)}`;
        parameters = { radius: inscribedRadius, semiperimeter };
    }
    else if (equilateralSide && equilateralSide > 0) {
        // Способ 4: Равносторонний треугольник
        areaInSelectedUnit = (Math.pow(equilateralSide, 2) * Math.sqrt(3)) / 4;
        formula = 'S = (a² × √3) / 4';
        steps = `S = (${equilateralSide}² × √3) / 4 = ${areaInSelectedUnit.toFixed(4)} (√3 ≈ 1.732)`;
        parameters = { side: equilateralSide };
    }
    else if (circumRadius && circumRadius > 0) {
        // Способ 5: По радиусу описанной окружности (равносторонний)
        areaInSelectedUnit = (3 * Math.sqrt(3) * Math.pow(circumRadius, 2)) / 4;
        formula = 'S = (3√3 × R²) / 4';
        steps = `S = (3 × √3 × ${circumRadius}²) / 4 = ${areaInSelectedUnit.toFixed(4)} (√3 ≈ 1.732)`;
        parameters = { circumRadius };
    }
    else if (equilateralInscribed && equilateralInscribed > 0) {
        // Способ 6: По радиусу вписанной окружности (равносторонний)
        areaInSelectedUnit = 3 * Math.sqrt(3) * Math.pow(equilateralInscribed, 2);
        formula = 'S = 3√3 × r²';
        steps = `S = 3 × √3 × ${equilateralInscribed}² = ${areaInSelectedUnit.toFixed(4)} (√3 ≈ 1.732)`;
        parameters = { inscribedRadius: equilateralInscribed };
    }
    else if (sideAngleA && sideAngleB && angle && sideAngleA > 0 && sideAngleB > 0 && angle > 0 && angle < 180) {
        // Способ 7: Две стороны и угол между ними
        const angleInRadians = angle * Math.PI / 180;
        areaInSelectedUnit = 0.5 * sideAngleA * sideAngleB * Math.sin(angleInRadians);
        formula = 'S = ½ × a × b × sin(γ)';
        steps = `S = ½ × ${sideAngleA} × ${sideAngleB} × sin(${angle}°) = ${areaInSelectedUnit.toFixed(4)}`;
        parameters = { sideA: sideAngleA, sideB: sideAngleB, angle };
    }
    else {
        throw new Error('Заполните поля для одного из способов расчета треугольника');
    }
    break;
                
            case 'circle':
                const radius = parseFloat(document.getElementById('circle-radius')?.value);
                if (!radius || radius <= 0) throw new Error('Введите положительное значение радиуса');
                areaInSelectedUnit = Math.PI * radius * radius;
                formula = 'S = π × r²';
                steps = `S = π × ${radius}² = ${areaInSelectedUnit.toFixed(4)} (π ≈ 3.14159)`;
                parameters = { radius };
                break;
                
            case 'trapezoid':
                const baseA = parseFloat(document.getElementById('trap-base-a')?.value);
                const baseB = parseFloat(document.getElementById('trap-base-b')?.value);
                const trapHeight = parseFloat(document.getElementById('trap-height')?.value);
                if (!baseA || !baseB || !trapHeight || baseA <= 0 || baseB <= 0 || trapHeight <= 0) {
                    throw new Error('Введите положительные значения для всех полей');
                }
                areaInSelectedUnit = 0.5 * (baseA + baseB) * trapHeight;
                formula = 'S = ½ × (a + b) × h';
                steps = `S = ½ × (${baseA} + ${baseB}) × ${trapHeight} = ${areaInSelectedUnit.toFixed(4)}`;
                parameters = { baseA, baseB, trapHeight };
                break;
                
            case 'ellipse':
                const majorAxis = parseFloat(document.getElementById('ellipse-major')?.value);
                const minorAxis = parseFloat(document.getElementById('ellipse-minor')?.value);
                if (!majorAxis || !minorAxis || majorAxis <= 0 || minorAxis <= 0) {
                    throw new Error('Введите положительные значения для полуосей');
                }
                areaInSelectedUnit = Math.PI * majorAxis * minorAxis;
                formula = 'S = π × a × b';
                steps = `S = π × ${majorAxis} × ${minorAxis} = ${areaInSelectedUnit.toFixed(4)} (π ≈ 3.14159)`;
                parameters = { majorAxis, minorAxis };
                break;
                
            // НОВЫЕ ФИГУРЫ
            case 'rhombus':
                const diag1 = parseFloat(document.getElementById('rhombus-diag1')?.value);
                const diag2 = parseFloat(document.getElementById('rhombus-diag2')?.value);
                const rhombusSide = parseFloat(document.getElementById('rhombus-side')?.value);
                const rhombusHeight = parseFloat(document.getElementById('rhombus-height')?.value);
                
                // Проверяем какой способ использован
                if (diag1 && diag2 && diag1 > 0 && diag2 > 0) {
                    // Расчет через диагонали
                    areaInSelectedUnit = (diag1 * diag2) / 2;
                    formula = 'S = (d₁ × d₂) ÷ 2';
                    steps = `S = (${diag1} × ${diag2}) ÷ 2 = ${areaInSelectedUnit.toFixed(4)}`;
                    parameters = { diag1, diag2 };
                } 
                else if (rhombusSide && rhombusHeight && rhombusSide > 0 && rhombusHeight > 0) {
                    // Расчет через сторону и высоту
                    areaInSelectedUnit = rhombusSide * rhombusHeight;
                    formula = 'S = a × h';
                    steps = `S = ${rhombusSide} × ${rhombusHeight} = ${areaInSelectedUnit.toFixed(4)}`;
                    parameters = { side: rhombusSide, height: rhombusHeight };
                }
                else {
                    throw new Error('Заполните поля для одного из способов расчета');
                }
                break;
                
            case 'parallelogram':
                const parBase = parseFloat(document.getElementById('parallelogram-base')?.value);
                const parHeight = parseFloat(document.getElementById('parallelogram-height')?.value);
                const parSideA = parseFloat(document.getElementById('parallelogram-side-a')?.value);
                const parSideB = parseFloat(document.getElementById('parallelogram-side-b')?.value);
                const parAngle = parseFloat(document.getElementById('parallelogram-angle')?.value);
                
                // Проверяем какой способ использован
                if (parBase && parHeight && parBase > 0 && parHeight > 0) {
                    // Расчет через основание и высоту
                    areaInSelectedUnit = parBase * parHeight;
                    formula = 'S = a × h';
                    steps = `S = ${parBase} × ${parHeight} = ${areaInSelectedUnit.toFixed(4)}`;
                    parameters = { base: parBase, height: parHeight };
                } 
                else if (parSideA && parSideB && parAngle && parSideA > 0 && parSideB > 0 && parAngle > 0 && parAngle < 180) {
                    // Расчет через стороны и угол
                    // Конвертируем градусы в радианы для Math.sin
                    const angleInRadians = parAngle * Math.PI / 180;
                    areaInSelectedUnit = parSideA * parSideB * Math.sin(angleInRadians);
                    formula = 'S = a × b × sin(α)';
                    steps = `S = ${parSideA} × ${parSideB} × sin(${parAngle}°) = ${areaInSelectedUnit.toFixed(4)}`;
                    parameters = { sideA: parSideA, sideB: parSideB, angle: parAngle };
                }
                else {
                    throw new Error('Заполните поля для одного из способов расчета');
                }
                break;
        }
        
        // Форматируем результат с правильным количеством знаков
        const formattedArea = formatAreaValue(areaInSelectedUnit);
        
        // Показываем результат
        showResult(formattedArea, unit, formula, steps);
        
        // Сохраняем в историю
        saveToHistory(formattedArea, unit, formula, parameters);
        
    } catch (error) {
        alert(error.message);
    }
}

// Форматирование значения площади
function formatAreaValue(value) {
    if (value >= 1000000) {
        return value.toExponential(4);
    } else if (value >= 10000) {
        return value.toFixed(0);
    } else if (value >= 100) {
        return value.toFixed(2);
    } else if (value >= 1) {
        return value.toFixed(3);
    } else if (value > 0) {
        return value.toFixed(6);
    } else {
        return value.toFixed(2);
    }
}

// Конвертация площади
function convertArea(value, fromUnit, toUnit) {
    // Сначала конвертируем в квадратные метры
    const valueInSquareMeters = value * unitConversionRates[fromUnit];
    
    // Затем конвертируем из квадратных метров в целевую единицу
    const convertedValue = valueInSquareMeters / unitConversionRates[toUnit];
    
    return convertedValue;
}

// Показать результат
function showResult(area, unit, formula, steps) {
    const resultElement = document.getElementById('result');
    const formulaElement = document.getElementById('formula-text');
    const stepsElement = document.getElementById('steps-text');
    
    // Анимированное отображение результата
    resultElement.innerHTML = `
        <div class="result-animation">
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px; color: #4CAF50;"></i>
            <div class="result-value" style="font-size: 2.5rem; font-weight: bold;">${area} ${unit}</div>
            <div class="result-unit" style="font-size: 1rem; opacity: 0.9;">${unitDisplayNames[unit] || unit}</div>
        </div>
    `;
    
    formulaElement.textContent = formula;
    stepsElement.textContent = steps;
}

// Получение текущих параметров для истории
function getCurrentParameters() {
    const params = [];
    const inputs = document.querySelectorAll('#shape-inputs input');
    inputs.forEach(input => {
        if (input.value) {
            const label = input.closest('.input-group')?.querySelector('label')?.textContent || input.id;
            params.push(`${label}: ${input.value}`);
        }
    });
    return params.join(', ');
}

// Сохранение в историю
function saveToHistory(area, unit, formula, parameters = {}) {
    const shapeNames = {
        'square': 'Квадрат',
        'rectangle': 'Прямоугольник',
        'triangle': 'Треугольник',
        'circle': 'Круг',
        'trapezoid': 'Трапеция',
        'ellipse': 'Эллипс',
        'rhombus': 'Ромб',
        'parallelogram': 'Параллелограмм'
    };
    
    const historyItem = {
        id: Date.now(),
        shape: currentShape,
        shapeName: shapeNames[currentShape] || currentShape,
        area: area.toString(),
        unit: unit,
        formula: formula,
        date: new Date().toLocaleString('ru-RU'),
        parameters: getCurrentParameters() || Object.values(parameters).join(', ')
    };
    
    calculationHistory.unshift(historyItem);
    
    // Ограничиваем историю 50 записями
    if (calculationHistory.length > 50) {
        calculationHistory = calculationHistory.slice(0, 50);
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('areaHistory', JSON.stringify(calculationHistory));
    
    // Обновляем таблицу
    updateHistoryTable();
}

// Обновление таблицы истории
function updateHistoryTable() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (calculationHistory.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 30px;">
                <i class="fas fa-history" style="font-size: 2rem; opacity: 0.5;"></i>
                <p style="margin-top: 10px;">История расчетов пуста</p>
            </td>
        `;
        tbody.appendChild(emptyRow);
        return;
    }
    
    calculationHistory.forEach(item => {
        const row = document.createElement('tr');
        
        // Добавляем иконку в зависимости от фигуры
        let shapeIcon = '';
        switch(item.shape) {
            case 'square': shapeIcon = 'fa-square'; break;
            case 'rectangle': shapeIcon = 'fa-rectangle-landscape'; break;
            case 'triangle': shapeIcon = 'fa-play'; break;
            case 'circle': shapeIcon = 'fa-circle'; break;
            case 'trapezoid': shapeIcon = 'fa-shapes'; break;
            case 'ellipse': shapeIcon = 'fa-egg'; break;
            case 'rhombus': shapeIcon = 'fa-gem'; break;
            case 'parallelogram': shapeIcon = 'fa-sliders-h'; break;
            default: shapeIcon = 'fa-shape';
        }
        
        row.innerHTML = `
            <td><i class="fas ${shapeIcon}" style="margin-right: 8px;"></i> ${item.shapeName || getShapeName(item.shape)}</td>
            <td>${item.parameters || '-'}</td>
            <td><strong>${item.area}</strong> ${unitDisplayNames[item.unit] || item.unit}</td>
            <td>${item.date}</td>
            <td>
                <button class="history-btn" onclick="deleteHistoryItem(${item.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="history-btn" onclick="useHistoryItem(${item.id})" title="Использовать">
                    <i class="fas fa-redo-alt"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Загрузка истории
function loadHistory() {
    updateHistoryTable();
}

// Получение имени фигуры
function getShapeName(shapeType) {
    const names = {
        'square': 'Квадрат',
        'rectangle': 'Прямоугольник',
        'triangle': 'Треугольник',
        'circle': 'Круг',
        'trapezoid': 'Трапеция',
        'ellipse': 'Эллипс',
        'rhombus': 'Ромб',
        'parallelogram': 'Параллелограмм'
    };
    return names[shapeType] || shapeType;
}

// Удаление из истории (глобальная функция)
window.deleteHistoryItem = function(id) {
    if (confirm('Удалить эту запись из истории?')) {
        calculationHistory = calculationHistory.filter(item => item.id !== id);
        localStorage.setItem('areaHistory', JSON.stringify(calculationHistory));
        updateHistoryTable();
    }
};

// Использование истории (глобальная функция)
window.useHistoryItem = function(id) {
    const item = calculationHistory.find(item => item.id === id);
    if (item) {
        // Находим соответствующую карточку
        const shapeCard = document.querySelector(`[data-shape="${item.shape}"]`);
        if (shapeCard) {
            shapeCard.click();
            
            // Небольшая задержка для появления полей ввода
            setTimeout(() => {
                // Устанавливаем единицы измерения
                const unitSelect = document.getElementById('unit');
                if (unitSelect) {
                    unitSelect.value = item.unit;
                }
                
                // Показываем результат
                showResult(item.area, item.unit, item.formula, 'Восстановлено из истории');
            }, 100);
        }
    }
};

// Конвертер единиц
function setupUnitConverter() {
    // const convertBtn = document.getElementById('convert-btn');
    const converterValue = document.getElementById('converter-value');
    const converterFrom = document.getElementById('converter-from');
    const converterTo = document.getElementById('converter-to');
    const converterResult = document.getElementById('converter-result');
    
    if ( !converterValue || !converterFrom || !converterTo || !converterResult) {
        console.error('Элементы конвертера не найдены');
        return;
    }
    
    // Функция конвертации
    function performConversion() {
        const value = parseFloat(converterValue.value);
        
        if (isNaN(value) || value <= 0) {
            converterResult.textContent = '0';
            converterResult.style.color = '#ff6b6b';
            return;
        }
        
        const fromUnit = converterFrom.value;
        const toUnit = converterTo.value;
        
        // Выполняем конвертацию
        const result = convertArea(value, fromUnit, toUnit);
        
        // Форматируем результат
        let formattedResult;
        if (result >= 1000000) {
            formattedResult = result.toExponential(4);
        } else if (result >= 10000) {
            formattedResult = result.toFixed(0);
        } else if (result >= 100) {
            formattedResult = result.toFixed(2);
        } else if (result >= 1) {
            formattedResult = result.toFixed(3);
        } else if (result > 0) {
            formattedResult = result.toFixed(6);
        } else {
            formattedResult = '0';
        }
        
        converterResult.textContent = formattedResult;
        converterResult.style.color = 'var(--text-color)';
    }
    
    //  convertBtn.addEventListener('click', performConversion); Обработчик кнопки
  
    
    // Автоматическая конвертация при изменении полей
    converterValue.addEventListener('input', performConversion);
    converterFrom.addEventListener('change', performConversion);
    converterTo.addEventListener('change', performConversion);
    
    // Конвертация при загрузке
    if (converterValue.value) {
        performConversion();
    }
}

// Переключение темы
function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (!themeToggle || !themeIcon) return;
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', newTheme);
    });
}

// Настройка всех обработчиков событий
function setupEventListeners() {
    // Кнопка расчета
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateArea);
    }
    
    // Очистка истории
    const clearHistoryBtn = document.getElementById('clear-history');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите очистить всю историю?')) {
                calculationHistory = [];
                localStorage.removeItem('areaHistory');
                updateHistoryTable();
            }
        });
    }
    
    // Сохранение истории
    const saveHistoryBtn = document.getElementById('save-history');
    if (saveHistoryBtn) {
        saveHistoryBtn.addEventListener('click', function() {
            if (calculationHistory.length === 0) {
                alert('История пуста');
                return;
            }
            
            const data = JSON.stringify(calculationHistory, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `area_history_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Ввод с клавиатуры (Enter для расчета)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('shape-input')) {
            calculateArea();
        }
    });
    
    // Изменение стиля навигации при прокрутке
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.background = 'var(--card-bg)';
        } else {
            navbar.style.boxShadow = 'var(--shadow)';
            navbar.style.backdropFilter = 'none';
            navbar.style.background = 'var(--card-bg)';
        }
    });
}

// Инициализация подсказок
function initializeTooltips() {
    // Добавляем подсказки для полей ввода
    const style = document.createElement('style');
    style.textContent = `
        .input-group {
            margin-bottom: 20px;
            animation: slideIn 0.3s ease;
            position: relative;
        }
        
        .input-group small {
            display: block;
            color: #888;
            margin-top: 5px;
            font-size: 0.85rem;
        }
        
        .input-divider {
            text-align: center;
            margin: 15px 0;
            color: var(--primary-color);
            font-weight: bold;
            position: relative;
        }
        
        .input-divider::before,
        .input-divider::after {
            content: "";
            position: absolute;
            top: 50%;
            width: 30%;
            height: 1px;
            background: #ddd;
        }
        
        .input-divider::before {
            left: 0;
        }
        
        .input-divider::after {
            right: 0;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .history-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px 10px;
            margin: 0 2px;
            border-radius: 5px;
            transition: all 0.3s;
            color: var(--text-color);
        }
        
        .history-btn:hover {
            background: var(--primary-color);
            color: white;
            transform: scale(1.1);
        }
        
        .result-animation {
            animation: pulse 0.5s ease;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(0.95);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .calculate-btn:active {
            transform: scale(0.98);
        }
        
        .converter-container {
            transition: all 0.3s ease;
        }
        
        .converter-container:hover {
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        /* Стили для новых фигур */
        [data-shape="rhombus"] i,
        [data-shape="parallelogram"] i {
            transition: transform 0.3s;
        }
        
        [data-shape="rhombus"]:hover i,
        [data-shape="parallelogram"]:hover i {
            transform: rotate(15deg);
        }
    `;
    
    document.head.appendChild(style);
}

// Выводим информацию о загрузке
console.log('✅ Калькулятор площадей готов к работе!');
console.log('📐 Доступные фигуры: Квадрат, Прямоугольник, Треугольник, Круг, Трапеция, Эллипс, Ромб, Параллелограмм');
console.log('📏 Доступные единицы измерения:', Object.keys(unitConversionRates));