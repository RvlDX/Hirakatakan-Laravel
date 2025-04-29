document.addEventListener('DOMContentLoaded', () => {
    // --- State Aplikasi ---
    let currentScript = null; // Untuk quiz
    let selectedSubCategories = []; // Untuk quiz
    let quizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let incorrectAnswers = 0;
    let questionStartTime; // Not currently used in provided code, keep for completeness
    let currentTheme = localStorage.getItem('theme') || 'light';
    let currentLearningScript = localStorage.getItem('selectedLearningScript') || 'hiragana'; // State untuk halaman kamus/learning
    let synth = window.speechSynthesis; // Akses Speech Synthesis API
    let japaneseVoice = null; // Variabel untuk menyimpan suara Jepang jika ditemukan
    let quizData = []; // Variabel global untuk menyimpan data quiz fetched dari backend

    // Deteksi halaman saat ini
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
    let currentPage = pathSegments.pop() || 'index';
    if (currentPage.endsWith('.html')) {
        currentPage = currentPage.replace('.html', ''); // Remove .html if present
    }
    // Handle root URL case like '/'
    if (window.location.pathname === '/' || window.location.pathname === '/index.php') {
        currentPage = 'index';
    }

    console.log('Current page detected:', currentPage);

    // --- Elemen DOM (Global) ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector('i') : null;
    const notificationArea = document.getElementById('notification-area');


    // --- Fungsi Notifikasi ---
    let notificationTimeout;
    function showNotification(message, duration = 3000) {
        if (!notificationArea) {
            console.error('Notification area not found');
            alert(message); // Fallback to alert if no notification area
            return;
        }

        clearTimeout(notificationTimeout);
        notificationArea.textContent = message;

        // Add multiline class if message is long
        if (message.length > 50) {
            notificationArea.classList.add('multiline');
        } else {
            notificationArea.classList.remove('multiline');
        }

        notificationArea.classList.add('show');
        notificationTimeout = setTimeout(() => {
            notificationArea.classList.remove('show');
        }, duration);
    }

    // --- Fungsi Tema ---
    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        themeIcon.className = `fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`;
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }

    function toggleTheme() {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    }

    applyTheme(currentTheme);

    // --- Fungsi Navigasi ---
    function navigateTo(url) {
        console.log(`Navigating to: ${url}`);
        // Use absolute URL if needed, or relative based on your routing
        window.location.href = `/${url}`; // Assuming your routes are like /selectscript, /game, etc.
    }

    // --- Fungsi Memuat Data dari Backend ---
    async function fetchAndStoreQuizData() {
        console.log('Attempting to fetch quiz data...');
        // !!! PASTIKAN URL INI SESUAI DENGAN ROUTE LARAVEL ANDA !!!
        // Jika route Anda adalah '/api/database', gunakan itu.
        // Jika di web.php, mungkin '/database'. Sesuaikan!
        const apiUrl = '/api/database'; // Example: assuming an API route

        // Try loading from localStorage first
        const storedData = localStorage.getItem('allQuizData');
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                if (data && Array.isArray(data) && data.length > 0) {
                    quizData = data;
                    console.log('Quiz data loaded from localStorage.');
                    // Optional: Fetch fresh data in background anyway if needed
                    // fetch(apiUrl).then(response => response.json()).then(freshData => {
                    //     if (JSON.stringify(freshData) !== storedData) {
                    //          quizData = freshData;
                    //          localStorage.setItem('allQuizData', JSON.stringify(quizData));
                    //          console.log('Quiz data updated from backend.');
                    //     }
                    // }).catch(err => console.warn('Background fetch failed:', err));
                    return quizData; // Use stored data immediately
                } else {
                    console.log('Stored data was empty or invalid. Proceeding with fetch.');
                    localStorage.removeItem('allQuizData'); // Clear invalid data
                }
            } catch (e) {
                console.error('Failed to parse stored quiz data:', e);
                localStorage.removeItem('allQuizData'); // Clear invalid data
            }
        }


        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorText = await response.text(); // Read text for more details
                console.error(`HTTP error! status: ${response.status}`, errorText);
                showNotification(`Gagal memuat data: Server error ${response.status}`, 5000);
                return null; // Return null to indicate failure
            }

            const data = await response.json();
            if (!data || !Array.isArray(data)) {
                console.error('Fetched data is not a valid array:', data);
                showNotification('Format data dari server tidak valid.', 5000);
                return null;
            }

            console.log('Quiz data fetched successfully:', data);

            // Store fetched data globally and in localStorage
            quizData = data;
            localStorage.setItem('allQuizData', JSON.stringify(quizData));

            return quizData; // Return the fetched data
        } catch (error) {
            console.error('Error fetching quiz data:', error);
            showNotification(`Gagal memuat data: ${error.message}`, 5000);
            return null; // Return null to indicate failure
        }
    }

    // --- Fungsi Helper untuk Mengambil Opsi Salah ---
    function getDistractors(correctAnswer, answerPool, count = 3) {
        const distractors = new Set();
        // Ensure unique answers and exclude the correct one
        const uniqueAnswers = Array.from(new Set(answerPool)).filter(ans => ans !== correctAnswer);

        // If there aren't enough unique answers, take more from the pool or use placeholders
        let poolForDistractors = [...uniqueAnswers];
        while (poolForDistractors.length < count && answerPool.length > 1) {
            const randomAnswer = answerPool[Math.floor(Math.random() * answerPool.length)];
            if (randomAnswer !== correctAnswer && !poolForDistractors.includes(randomAnswer)) {
                poolForDistractors.push(randomAnswer);
            }
            console.log('Answer Pool:', answerPool);
        }

        // Shuffle the unique answers
        for (let i = uniqueAnswers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueAnswers[i], uniqueAnswers[j]] = [uniqueAnswers[j], uniqueAnswers[i]];
        }

        // Take the first 'count' answers as distr
        return uniqueAnswers.slice(0, count);
    }

    // --- Fungsi Mengumpulkan Soal (Berdasarkan Subkategori) ---
    function prepareQuizQuestions() {
        console.log('Preparing quiz questions...');
        quizQuestions = [];
        const rawQuestions = [];
        let allPossibleAnswers = []; // Pool of all readings for distractors

        // Ambil script dari localStorage
        currentScript = localStorage.getItem('selectedScript');
        if (!currentScript) {
            console.error('prepareQuizQuestions: No script selected.');
            showNotification('Tidak ada skrip yang dipilih untuk game.', 3000);
            navigateTo('selectscript'); // Redirect to script selection
            return false; // Indicate failure
        }

        // Ambil subcategories dari localStorage
        selectedSubCategories = JSON.parse(localStorage.getItem('selectedSubCategories') || '[]');
        console.log('prepareQuizQuestions: Selected subcategories:', selectedSubCategories);
        if (selectedSubCategories.length === 0) {
            console.error('prepareQuizQuestions: No subcategories selected.');
            showNotification('Tidak ada subkategori yang dipilih. Pilih minimal satu.', 3000);
            // navigateTo('selectcategory'); // Don't navigate here, button handler does it
            return false; // Indicate failure
        }

        // Ensure quizData is loaded
        if (!quizData || !Array.isArray(quizData) || quizData.length === 0) {
            console.error('prepareQuizQuestions: Quiz data not available.');
            showNotification('Data quiz tidak tersedia.', 3000);
            return false; // Indicate failure
        }


        const scriptData = quizData.find(scriptItem => scriptItem.key === currentScript);
        console.log('prepareQuizQuestions: Script data found:', scriptData ? true : false);


        if (!scriptData || !scriptData.categories) {
            console.error('prepareQuizQuestions: Script data not found or invalid for key:', currentScript);
            showNotification('Data untuk skrip ini tidak ditemukan.', 3000);
            navigateTo('selectscript'); // Redirect
            return false; // Indicate failure
        }

        // Collect all possible answers from ALL selected subcategories for the distractor pool
        selectedSubCategories.forEach(subCategoryValue => {
            const [mainCategoryKey, subCategoryKey] = subCategoryValue.split(':');
            if (scriptData.categories[mainCategoryKey] &&
                scriptData.categories[mainCategoryKey].subCategories &&
                scriptData.categories[mainCategoryKey].subCategories[subCategoryKey]) {
                const subCategoryData = scriptData.categories[mainCategoryKey].subCategories[subCategoryKey];
                for (const character in subCategoryData) {
                    const readingData = subCategoryData[character]; // Use readingData
                    if (readingData !== null && readingData !== undefined) {
                        let readingText = '';
                        if (typeof readingData === 'string') {
                            readingText = readingData; // Just the string
                        } else if (typeof readingData === 'object' && readingData !== null && readingData.reading) {
                            readingText = readingData.reading; // The 'reading' property
                        }
                        if (readingText) {
                            allPossibleAnswers.push(readingText);
                        }
                    }
                }
            }
        });
        console.log('prepareQuizQuestions: Collected all possible answers:', allPossibleAnswers.length);


        // Now collect the actual questions from selected subcategories
        selectedSubCategories.forEach(subCategoryValue => {
            // Value format: "mainKey:subKey"
            const [mainCategoryKey, subCategoryKey] = subCategoryValue.split(':');

            if (scriptData.categories[mainCategoryKey] &&
                scriptData.categories[mainCategoryKey].subCategories &&
                scriptData.categories[mainCategoryKey].subCategories[subCategoryKey]) {
                const subCategoryData = scriptData.categories[mainCategoryKey].subCategories[subCategoryKey];

                // subCategoryData is an object { character: readingData, ... }
                for (const character in subCategoryData) {
                    const readingData = subCategoryData[character]; // This is the answer
                    if (character !== null && character !== undefined && readingData !== null && readingData !== undefined) {

                        let answerText = '';
                        if (typeof readingData === 'string') {
                            answerText = readingData; // Use the string directly
                        } else if (typeof readingData === 'object' && readingData !== null && readingData.reading) {
                            answerText = readingData.reading; // Use the 'reading' property for the answer
                        }

                        if (answerText) {
                            // Add question pair (character -> answerText)
                            rawQuestions.push({ q: character, a: answerText });
                        } else {
                            console.warn(`prepareQuizQuestions: Skipping invalid question data for char "${character}" in subcategory "${subCategoryKey}"`);
                        }
                    } else {
                        console.warn(`prepareQuizQuestions: Skipping item with missing character or reading data in subcategory "${subCategoryKey}"`);
                    }
                }
            } else {
                console.warn(`prepareQuizQuestions: Subcategory data not found for: ${subCategoryValue}`);
            }
        });

        console.log('prepareQuizQuestions: Raw questions collected:', rawQuestions.length);


        if (rawQuestions.length === 0) {
            console.warn('prepareQuizQuestions: No questions found in selected subcategories.');
            showNotification('Tidak ada soal ditemukan dalam subkategori yang dipilih.', 3000);
            return false; // Indicate failure
        }


        // Buat soal final dengan opsi
        rawQuestions.forEach(item => {
            const correctAnswer = item.a;
            // Generate distractors from the pool of all readings
            const distractors = getDistractors(correctAnswer, allPossibleAnswers, 3);
            const options = [correctAnswer, ...distractors]; // Include correct answer

            // Shuffle options for the current question
            options.sort(() => Math.random() - 0.5);

            quizQuestions.push({ q: item.q, a: correctAnswer, options: options });
        });

        // Acak soal secara keseluruhan
        for (let i = quizQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [quizQuestions[i], quizQuestions[j]] = [quizQuestions[j], quizQuestions[i]];
        }

        // Simpan quizQuestions ke localStorage
        localStorage.setItem('quizQuestions', JSON.stringify(quizQuestions));
        console.log(`prepareQuizQuestions: Prepared ${quizQuestions.length} quiz questions.`);
        return true; // Indicate success
    }

    // --- Fungsi Menampilkan Soal ---
    function displayQuestion() {
        const questionCounter = document.getElementById('question-counter');
        const currentScoreDisplay = document.getElementById('current-score');
        const questionDisplay = document.getElementById('question-display');
        const optionsContainer = document.getElementById('options-container');
        const feedbackArea = document.getElementById('feedback-area');
        const skipButton = document.getElementById('skip-button'); // Check if skip button exists


        // Ensure state is loaded from localStorage
        if (quizQuestions.length === 0) {
            console.log('displayQuestion: Loading state from localStorage...');
            const storedQuestions = localStorage.getItem('quizQuestions');
            if (storedQuestions) {
                quizQuestions = JSON.parse(storedQuestions);
                score = parseInt(localStorage.getItem('score') || '0');
                incorrectAnswers = parseInt(localStorage.getItem('incorrectAnswers') || '0');
                currentQuestionIndex = parseInt(localStorage.getItem('currentQuestionIndex') || '0');
                console.log(`displayQuestion: Loaded ${quizQuestions.length} questions, index ${currentQuestionIndex}, score ${score}`);
            } else {
                console.error('displayQuestion: No quiz questions found in localStorage.');
                showNotification('Tidak ada soal untuk ditampilkan. Silakan mulai quiz baru.', 4000);
                navigateTo('selectcategory');
                return;
            }
        }


        if (currentQuestionIndex >= quizQuestions.length || quizQuestions.length === 0) {
            console.log('displayQuestion: Quiz finished or no questions available.');
            // Simpan hasil akhir ke localStorage
            localStorage.setItem('score', score);
            localStorage.setItem('incorrectAnswers', incorrectAnswers);
            localStorage.setItem('totalQuestions', quizQuestions.length); // Store total number of questions attempted

            // Navigasi ke halaman hasil
            navigateTo('result'); // Use navigateTo for routing
            return;
        }

        const questionData = quizQuestions[currentQuestionIndex];

        if (questionDisplay) {
            questionDisplay.textContent = questionData.q;
        }

        if (optionsContainer) {
            optionsContainer.innerHTML = ''; // Clear previous options
        }

        if (feedbackArea) {
            feedbackArea.textContent = ''; // Clear text, but element remains
            feedbackArea.className = 'feedback-placeholder'; // Reset class
        }

        // Options are already shuffled when preparing questions, use them directly
        const options = questionData.options;

        if (optionsContainer) {
            options.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('btn', 'btn-option');
                button.textContent = option;
                button.dataset.answer = option;
                button.addEventListener('click', handleAnswer);
                optionsContainer.appendChild(button);
            });
        }

        if (questionCounter) {
            questionCounter.textContent = `Soal ${currentQuestionIndex + 1}/${quizQuestions.length}`;
        }

        if (currentScoreDisplay) {
            currentScoreDisplay.textContent = `Skor: ${score}`;
        }

        // Re-enable skip button if it exists
        if (skipButton) {
            skipButton.disabled = false;
            skipButton.onclick = handleSkip; // Attach skip handler
        }

        questionStartTime = Date.now();
        console.log(`displayQuestion: Displaying question ${currentQuestionIndex + 1}: "${questionData.q}"`);
    }

    // --- Fungsi Confetti ---
    let confettiInstance = null;
    const confettiCanvas = document.getElementById('confetti-canvas');

    if (confettiCanvas) {
        confettiInstance = confetti.create(confettiCanvas, { resize: true, useWorker: true });
    }

    function triggerConfetti() {
        if (confettiInstance) {
            confettiInstance({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
    }

    // --- Fungsi Menangani Jawaban ---
    function handleAnswer(event) {
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.dataset.answer;

        // Ensure state is loaded
        if (quizQuestions.length === 0) {
            console.error('handleAnswer: Quiz state not loaded.');
            // Attempt to reload or navigate back?
            showNotification('Terjadi kesalahan pada quiz. Memuat ulang.', 3000);
            setTimeout(() => navigateTo('selectcategory'), 3000); // Redirect
            return;
        }

        // Disable all option buttons immediately to prevent double clicking
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            const optionButtons = optionsContainer.querySelectorAll('.btn-option');
            optionButtons.forEach(btn => {
                btn.disabled = true;
                btn.removeEventListener('click', handleAnswer); // Remove listener
            });
        }

        // Disable skip button too if it exists
        const skipButton = document.getElementById('skip-button');
        if (skipButton) {
            skipButton.disabled = true;
            skipButton.onclick = null; // Remove skip handler
        }

        const correctAnswer = quizQuestions[currentQuestionIndex].a;
        const feedbackArea = document.getElementById('feedback-area');
        const currentScoreDisplay = document.getElementById('current-score');


        if (selectedAnswer === correctAnswer) {
            score++;
            selectedButton.classList.add('correct');

            // Assuming triggerConfetti is globally available if needed
            if (typeof triggerConfetti === 'function') {
                triggerConfetti();
            }
        } else {
            incorrectAnswers++;
            selectedButton.classList.add('incorrect');

            // Highlight the correct answer if options are visible
            if (optionsContainer) {
                const optionButtons = optionsContainer.querySelectorAll('.btn-option');
                optionButtons.forEach(btn => {
                    if (btn.dataset.answer === correctAnswer) {
                        btn.classList.add('correct');
                    }
                });
            }
        }

        if (currentScoreDisplay) {
            currentScoreDisplay.textContent = `Skor: ${score}`;
        }

        // Simpan skor saat ini dan index ke localStorage
        localStorage.setItem('score', score);
        localStorage.setItem('incorrectAnswers', incorrectAnswers);
        localStorage.setItem('currentQuestionIndex', currentQuestionIndex + 1); // Store index for next question
        currentQuestionIndex++; // Tambahkan ini untuk memperbarui variabel di memori

        // Move to the next question after a delay
        setTimeout(() => {
            // currentQuestionIndex is updated in the next displayQuestion call from localStorage
            displayQuestion(); // Display next question or end quiz
        }, 1500); // Wait for 1.5 seconds to show feedback
    }

    // --- Fungsi Menangani Skip Soal ---
    function handleSkip() {
        console.log('handleSkip: Question skipped.');

        // Ensure state is loaded
        if (quizQuestions.length === 0) {
            console.error('handleSkip: Quiz state not loaded.');
            showNotification('Terjadi kesalahan pada quiz. Memuat ulang.', 3000);
            setTimeout(() => navigateTo('selectcategory'), 3000); // Redirect
            return;
        }

        // Count as incorrect
        incorrectAnswers++;
        localStorage.setItem('incorrectAnswers', incorrectAnswers);

        // Disable buttons
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            const optionButtons = optionsContainer.querySelectorAll('.btn-option');
            optionButtons.forEach(btn => {
                btn.disabled = true;
                btn.removeEventListener('click', handleAnswer);
            });
        }
        const skipButton = document.getElementById('skip-button');
        if (skipButton) {
            skipButton.disabled = true;
            skipButton.onclick = null;
        }

        // Update feedback area
        const feedbackArea = document.getElementById('feedback-area');
        if (feedbackArea) {
            const correctAnswer = quizQuestions[currentQuestionIndex].a;
            feedbackArea.textContent = `Dilewati. Jawaban: ${correctAnswer}`;
            feedbackArea.className = 'feedback-area skipped'; // Add skipped class
        }

        // Highlight correct answer if options are visible
        if (optionsContainer) {
            const optionButtons = optionsContainer.querySelectorAll('.btn-option');
            optionButtons.forEach(btn => {
                if (btn.dataset.answer === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }


        // Move to the next question after a short delay
        localStorage.setItem('currentQuestionIndex', currentQuestionIndex + 1); // Store index for next question
        setTimeout(() => {
            // currentQuestionIndex is updated in the next displayQuestion call from localStorage
            displayQuestion();
        }, 800); // Short delay for feedback
    }


    // --- Fungsi Menampilkan Hasil ---
    function showResults() {
        const resultTotal = document.getElementById('result-total');
        const resultCorrect = document.getElementById('result-correct');
        const resultWrong = document.getElementById('result-wrong');
        const resultPercentage = document.getElementById('result-percentage');
        const resultProgressBar = document.getElementById('result-progress-bar');
        const resultMessage = document.getElementById('result-message');


        // Ambil hasil dari localStorage
        const totalQuestions = parseInt(localStorage.getItem('totalQuestions') || '0');
        const correctAnswers = parseInt(localStorage.getItem('score') || '0');
        const wrongAnswers = parseInt(localStorage.getItem('incorrectAnswers') || '0');

        // Hitung persentase
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        // Tampilkan hasil
        if (resultTotal) resultTotal.textContent = totalQuestions;
        if (resultCorrect) resultCorrect.textContent = correctAnswers;
        if (resultWrong) resultWrong.textContent = wrongAnswers;
        if (resultPercentage) resultPercentage.textContent = `${percentage}%`;
        if (resultProgressBar) {
            resultProgressBar.style.width = `${percentage}%`;
            // Add classes based on percentage for progress bar color
            resultProgressBar.classList.remove('progress-bar-low', 'progress-bar-medium', 'progress-bar-high');
            if (percentage < 50) {
                resultProgressBar.classList.add('progress-bar-low');
            } else if (percentage < 80) {
                resultProgressBar.classList.add('progress-bar-medium');
            } else {
                resultProgressBar.classList.add('progress-bar-high');
            }
        }


        // Tampilkan pesan berdasarkan persentase
        if (resultMessage) {
            if (percentage >= 90) {
                resultMessage.textContent = 'Luar biasa! Kamu menguasai materi dengan sangat baik!';
                resultMessage.className = 'result-message high-score';
            } else if (percentage >= 70) {
                resultMessage.textContent = 'Bagus! Kamu sudah cukup menguasai materi.';
                resultMessage.className = 'result-message medium-score';
            } else if (percentage >= 50) {
                resultMessage.textContent = 'Cukup baik. Teruslah berlatih untuk meningkatkan pemahaman.';
                resultMessage.className = 'result-message low-score';
            } else {
                resultMessage.textContent = 'Jangan menyerah! Cobalah untuk berlatih lebih banyak.';
                resultMessage.className = 'result-message very-low-score';
            }
        }

        // Clear quiz state from localStorage after showing results
        localStorage.removeItem('quizQuestions');
        localStorage.removeItem('currentQuestionIndex');
        localStorage.removeItem('score');
        localStorage.removeItem('incorrectAnswers');
        localStorage.removeItem('totalQuestions');
    }

    // --- Fungsi Memuat Kategori (untuk halaman selectcategory) ---
    function loadCategories() {
        console.log('loadCategories: Loading categories UI...');

        // Ensure quizData is available
        if (!quizData || !Array.isArray(quizData) || quizData.length === 0) {
            console.error('loadCategories: Quiz data is not loaded or invalid.');
            showNotification("Data quiz tidak tersedia untuk memilih kategori.", 4000);
            // Maybe redirect or show an error state on the page
            disableDataDependentFeatures(); // Disable UI elements
            return;
        }

        // Get the selected script key from localStorage
        const scriptKey = localStorage.getItem('selectedScript');
        console.log('loadCategories: Selected script key:', scriptKey);


        if (!scriptKey) {
            console.error('loadCategories: No script selected.');
            showNotification("Tidak ada script yang dipilih. Silakan pilih script terlebih dahulu.", 3000);
            navigateTo('selectscript'); // Redirect to script selection page
            return;
        }

        const scriptData = quizData.find(scriptItem => scriptItem.key === scriptKey);
        console.log('loadCategories: Script data found:', scriptData ? true : false);


        if (!scriptData || !scriptData.categories) {
            console.error('loadCategories: Data kategori tidak ditemukan untuk script:', scriptKey);
            showNotification("Data kategori tidak ditemukan untuk script ini.", 4000);
            // Maybe redirect back or show error
            navigateTo('selectscript');
            return;
        }

        console.log('loadCategories: Rendering categories for script:', scriptData.title);

        // Cari elemen-elemen yang diperlukan
        const selectedScriptTitle = document.getElementById('selected-script-title');
        let mainCategoryContainer = document.getElementById('main-category-container') || document.querySelector('.category-accordion');
        const startGameButton = document.getElementById('start-game-button'); // Get it if it exists

        // Update script title display
        if (selectedScriptTitle) {
            selectedScriptTitle.textContent = `(${scriptData.title})`;
        }

        // Check if main category container exists, if not, the page structure might be wrong
        if (!mainCategoryContainer) {
            console.error('loadCategories: Main category container (.category-accordion or #main-category-container) not found. Cannot render categories.');
            showNotification('Elemen UI untuk kategori tidak ditemukan.', 4000);
            disableDataDependentFeatures(); // Disable UI
            return;
        }

        mainCategoryContainer.innerHTML = ''; // Clear existing accordion items
        selectedSubCategories = JSON.parse(localStorage.getItem('selectedSubCategories') || '[]'); // Load previously selected subcategories
        console.log('loadCategories: Loaded previously selected subcategories:', selectedSubCategories);


        // Build each accordion item for the main categories
        Object.entries(scriptData.categories).forEach(([categoryKey, category]) => {
            if (category && typeof category === 'object' && category.name && category.subCategories && typeof category.subCategories === 'object') {

                const mainCategoryItem = document.createElement('div');
                mainCategoryItem.classList.add('main-category-item');
                mainCategoryItem.dataset.mainKey = categoryKey; // Store key

                // Header Accordion (clickable)
                const header = document.createElement('div');
                header.classList.add('main-category-header');
                header.innerHTML = `
                    <span>${category.name}</span>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                `;
                header.addEventListener('click', () => {
                    mainCategoryItem.classList.toggle('active');
                });

                // Container for subcategories (hidden initially)
                const subListContainer = document.createElement('div');
                subListContainer.classList.add('subcategory-list');

                const subOptionsGrid = document.createElement('div');
                subOptionsGrid.classList.add('subcategory-options');

                // Create checkbox for each subcategory
                Object.entries(category.subCategories).forEach(([subCategoryKey, questions]) => {
                    // subCategory here is the questions object { char: readingData, ... }
                    if (questions && typeof questions === 'object' && Object.keys(questions).length > 0) { // Only add subcategory if it has questions
                        const subCategoryItem = document.createElement('div');
                        subCategoryItem.classList.add('subcategory-item');
                        // Create a valid ID
                        const checkboxId = `subcat-${categoryKey}-${subCategoryKey.replace(/[^a-zA-Z0-9-_]/g, '')}`;
                        // Value format: "mainKey:subKey"
                        const checkboxValue = `${categoryKey}:${subCategoryKey}`;

                        // Check if this subcategory was previously selected
                        const isSelected = selectedSubCategories.includes(checkboxValue);

                        subCategoryItem.innerHTML = `
                            <label for="${checkboxId}">
                                <input type="checkbox" id="${checkboxId}" name="subcategory" value="${checkboxValue}" ${isSelected ? 'checked' : ''}>
                                <span>${subCategoryKey} (${Object.keys(questions).length})</span> </label>
                        `;
                        subOptionsGrid.appendChild(subCategoryItem);
                    } else {
                        console.warn(`loadCategories: Subcategory key "${subCategoryKey}" in category "${categoryKey}" has no questions.`);
                    }
                });

                // Only add the category if it contains subcategories with questions
                if (subOptionsGrid.children.length > 0) {
                    subListContainer.appendChild(subOptionsGrid);
                    mainCategoryItem.appendChild(header);
                    mainCategoryItem.appendChild(subListContainer);
                    mainCategoryContainer.appendChild(mainCategoryItem);
                } else {
                    console.warn(`loadCategories: Category "${category.name}" has no subcategories with questions. Skipping section.`);
                }

            } else {
                console.warn(`loadCategories: Skipping invalid category data for key: ${categoryKey}`, category);
            }
        });

        // Ensure the start button state is correct based on loaded selections
        if (startGameButton) {
            startGameButton.disabled = selectedSubCategories.length === 0;
            console.log('loadCategories: Start game button disabled state:', startGameButton.disabled);
        }

        console.log('loadCategories: Category UI rendering complete.');

        // Add event listener for checkboxes using delegation in initializeSelectCategoryPage
    }


    // --- Speech Synthesis Functions ---
    function initializeSpeechSynthesis() {
        console.log('Initializing Speech Synthesis...');
        if (!synth) {
            console.warn('Speech synthesis not supported by this browser.');
            return;
        }
        // Wait for voices to be loaded
        if (synth.getVoices().length === 0) {
            synth.onvoiceschanged = () => {
                findJapaneseVoice();
            };
        } else {
            findJapaneseVoice();
        }
    }

    function findJapaneseVoice() {
        const voices = synth.getVoices();
        // Prioritize specific Japanese voices, fall back to any Japanese voice
        // Common good voices include 'Google 日本語', 'Microsoft Haruka Online - Japanese (Japan)'
        const preferredVoiceNames = ['Google 日本語', 'Microsoft Haruka']; // Add others if known
        japaneseVoice = voices.find(voice =>
            voice.lang === 'ja-JP' && preferredVoiceNames.some(name => voice.name.includes(name))
        ) || voices.find(voice => voice.lang === 'ja-JP'); // Fallback to any ja-JP voice


        if (japaneseVoice) {
            console.log('Japanese voice found:', japaneseVoice.name);
        } else {
            console.warn('Japanese voice not found. Speech synthesis may not work.');
            showNotification('Suara Bahasa Jepang tidak ditemukan. Fitur suara dinonaktifkan.', 4000);
            // Optionally disable speak buttons if voice is crucial
        }
    }

    function speakText(text) {
        if (!synth || !japaneseVoice) {
            console.warn('Speech synthesis not ready or voice not available.');
            // showNotification('Fitur suara tidak siap.', 2000); // Avoid spamming notifications
            return;
        }

        // Cancel any previous speech to prevent stacking
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = japaneseVoice;
        utterance.lang = 'ja-JP'; // Ensure language is set correctly
        utterance.rate = 0.9; // Adjust speed if needed (0.1 to 10)
        utterance.pitch = 1; // Adjust pitch if needed (0 to 2)

        synth.speak(utterance);
        console.log('Speaking:', text);
    }

    // --- Helper function for animation ---
    function addPulseAnimation(element) {
        // Add the class that triggers the animation
        element.classList.add('active-pulse');

        // Remove the class after the animation duration
        // Make sure this timeout matches your CSS animation duration (e.g., 500ms)
        setTimeout(() => {
            element.classList.remove('active-pulse');
        }, 500); // Assuming animation is 0.5s (adjust if needed)
    }


    // --- Fungsi Load Data untuk Halaman Learning/Kamus (Disesuaikan dengan CSS & Interaksi Baru) ---
    function loadLearningData(scriptKey) {
        console.log('loadLearningData: Loading learning data for script:', scriptKey);
        const learningContentArea = document.getElementById('learning-content'); // Assuming this is the container

        if (!learningContentArea) {
            console.error('loadLearningData: Learning content area not found.');
            return;
        }

        // Clear previous content except for the header and script tabs
        const header = learningContentArea.querySelector('.learning-header');
        const tabs = learningContentArea.querySelector('.script-tabs');
        // Temporarily store non-dynamic elements
        const nonDynamicElements = [];
        if (header) nonDynamicElements.push(header);
        if (tabs) nonDynamicElements.push(tabs);

        learningContentArea.innerHTML = ''; // Clear all content

        // Re-append non-dynamic elements
        nonDynamicElements.forEach(el => learningContentArea.appendChild(el));


        const contentWrapper = document.createElement('div');
        // Use the existing .learning-content class for the wrapper if that's where dynamic content goes
        // Based on the CSS, .learning-content seems to be the main container for dynamic data below header/tabs
        contentWrapper.classList.add('learning-content'); // Use the class from CSS


        // Ensure quizData is available
        if (!quizData || !Array.isArray(quizData) || quizData.length === 0) {
            contentWrapper.innerHTML = '<p>Data pembelajaran tidak tersedia.</p>';
            console.error('loadLearningData: Quiz data is not loaded or invalid.');
            showNotification("Data pembelajaran tidak tersedia.", 4000);
            disableDataDependentFeatures(); // Disable UI elements
            learningContentArea.appendChild(contentWrapper); // Append the message wrapper
            return;
        }


        const scriptData = quizData.find(item => item.key === scriptKey);
        console.log('loadLearningData: Script data found:', scriptData ? true : false);


        if (!scriptData) {
            contentWrapper.innerHTML = '<p>Data untuk script ini tidak ditemukan.</p>';
            console.error('loadLearningData: Script data not found for learning:', scriptKey);
            showNotification('Data pembelajaran tidak ditemukan.', 3000);
            learningContentArea.appendChild(contentWrapper); // Append the message wrapper
            return;
        }

        // Add the script title below header/tabs, if you want it dynamically
        // You might already have this statically in your Blade, but dynamic is flexible
        // const scriptTitleElement = document.createElement('h3');
        // scriptTitleElement.textContent = scriptData.title;
        // contentWrapper.appendChild(scriptTitleElement); // Append inside contentWrapper


        // Iterate through categories and subcategories to display characters/readings
        if (scriptData.categories) {
            Object.entries(scriptData.categories).forEach(([categoryKey, category]) => {
                if (category && typeof category === 'object' && category.name && category.subCategories && typeof category.subCategories === 'object') {

                    const learningSection = document.createElement('div'); // Corresponds to .learning-section
                    learningSection.classList.add('learning-section');

                    const categoryTitle = document.createElement('h3'); // Corresponds to .learning-section h3
                    categoryTitle.textContent = category.name.toUpperCase(); // Often uppercase in learning views
                    learningSection.appendChild(categoryTitle);

                    let sectionHasContent = false; // Flag to check if this section should be added

                    Object.entries(category.subCategories).forEach(([subCategoryKey, questions]) => {
                        if (questions && typeof questions === 'object' && Object.keys(questions).length > 0) {

                            const learningGroup = document.createElement('div'); // Corresponds to .learning-group
                            learningGroup.classList.add('learning-group');

                            const subCategoryTitle = document.createElement('h4'); // Corresponds to .learning-group h4
                            subCategoryTitle.textContent = subCategoryKey;
                            learningGroup.appendChild(subCategoryTitle);

                            const characterGrid = document.createElement('div'); // Corresponds to .learning-characters
                            characterGrid.classList.add('learning-characters');

                            // Iterate through character/reading pairs
                            Object.entries(questions).forEach(([character, readingData]) => {
                                // readingData might be just the reading string or an object if Kanji includes meaning
                                const characterItem = document.createElement('div'); // Corresponds to .learning-char-item
                                characterItem.classList.add('learning-char-item');
                                characterItem.style.cursor = 'pointer'; // Add cursor pointer to indicate clickability

                                // Add click listener to the item
                                characterItem.addEventListener('click', () => {
                                    const charElement = characterItem.querySelector('.learning-char');
                                    if (charElement) {
                                        const textToSpeak = charElement.textContent; // Get text from the span
                                        console.log('Clicked character:', textToSpeak);
                                        speakText(textToSpeak); // Speak the text
                                        addPulseAnimation(characterItem); // Trigger animation
                                    } else {
                                        console.warn('Clicked item has no .learning-char element.');
                                    }
                                });


                                const characterSpan = document.createElement('span'); // Corresponds to .learning-char
                                characterSpan.classList.add('learning-char');
                                characterSpan.textContent = character;
                                characterItem.appendChild(characterSpan);

                                let readingText = '';
                                let meaningText = '';

                                // --- Perbaikan Format Bacaan/Arti ---
                                if (typeof readingData === 'string') {
                                    readingText = readingData; // Gunakan string apa adanya (tanpa kurung)
                                } else if (typeof readingData === 'object' && readingData !== null) {
                                    // Asumsi struktur objek: { reading: '...', meaning: '...' }
                                    // Sesuaikan jika struktur DB/JSON Anda berbeda!
                                    readingText = readingData.reading || '';
                                    meaningText = readingData.meaning || '';
                                }
                                // --- Akhir Perbaikan ---


                                if (readingText) {
                                    const readingSpan = document.createElement('span'); // Corresponds to .learning-reading
                                    readingSpan.classList.add('learning-reading');
                                    readingSpan.textContent = readingText; // Tidak perlu kurung di sini
                                    characterItem.appendChild(readingSpan);
                                }

                                if (meaningText) {
                                    const meaningSpan = document.createElement('span'); // Corresponds to .learning-meaning
                                    meaningSpan.classList.add('learning-meaning');
                                    meaningSpan.textContent = meaningText;
                                    characterItem.appendChild(meaningSpan);
                                }

                                characterGrid.appendChild(characterItem);
                            });

                            if (characterGrid.children.length > 0) {
                                learningGroup.appendChild(characterGrid);
                                learningSection.appendChild(learningGroup);
                                sectionHasContent = true; // Mark that this section contains content
                            } else {
                                console.warn(`loadLearningData: Subcategory key "${subCategoryKey}" in category "${categoryKey}" resulted in no characters.`);
                            }
                        } else {
                            console.warn(`loadLearningData: Subcategory key "${subCategoryKey}" in category "${categoryKey}" has no questions or invalid format.`);
                        }
                    });

                    // Only append the section if it actually contains groups with characters
                    if (sectionHasContent) {
                        contentWrapper.appendChild(learningSection);
                    } else {
                        console.warn(`loadLearningData: Category "${category.name}" has no subcategories with valid characters. Skipping section.`);
                    }

                } else {
                    console.warn(`loadLearningData: Skipping invalid category data for key: ${categoryKey}`, category);
                }
            });
        } else {
            contentWrapper.innerHTML += '<p>Tidak ada kategori dalam script ini.</p>';
        }

        learningContentArea.appendChild(contentWrapper); // Append the generated content wrapper

        console.log('loadLearningData: Learning data rendered with clickable items.');

        // Speak button listeners (delegated or individual) are now handled by clicking the item itself
        // No need for a separate speak button listener section here anymore
        console.log('loadLearningData: Speak button listeners no longer needed, clicks handled by item.');


        // Update active state on script tabs (this part was already correct and is outside loadLearningData)
        // This logic is handled in initializeLearningPage and should remain there.
        const scriptTabs = document.querySelector('.script-tabs');
        if (scriptTabs) {
            scriptTabs.querySelectorAll('.btn-script').forEach(btn => {
                if (btn.dataset.script === scriptKey) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            console.log('loadLearningData: Learning script tab active state updated.');
        }
    }


    // --- Fungsi Inisialisasi Berdasarkan Halaman ---
    async function initializePage() {
        console.log('Initializing page:', currentPage);

        // Pages that require quizData before rendering specific content
        const pagesRequiringData = ['selectscript', 'selectcategory', 'game', 'result', 'learning'];

        // Fetch data if needed, or if on index page (for pre-loading)
        if (pagesRequiringData.includes(currentPage) || currentPage === 'index') {
            console.log('initializePage: Fetching data...');
            const dataLoaded = await fetchAndStoreQuizData();
            if (dataLoaded === null) {
                // Data fetching failed. Handle this by disabling relevant UI elements
                console.error('initializePage: Data fetch failed. Disabling features.');
                disableDataDependentFeatures();
                // Still call the specific page initializer, but it should handle missing data
            }
            // Data is now available in global quizData (or is [])
            console.log('initializePage: Data loading attempt finished.');
        }


        // Page-specific initialization after data loading attempt
        switch (currentPage) {
            case 'index':
                console.log('initializePage: Calling initializeIndexPage');
                initializeIndexPage();
                break;
            case 'selectscript':
                console.log('initializePage: Calling initializeSelectScriptPage');
                initializeSelectScriptPage();
                break;
            case 'selectcategory':
                console.log('initializePage: Calling initializeSelectCategoryPage');
                initializeSelectCategoryPage();
                break;
            case 'game':
                console.log('initializePage: Calling initializeGamePage');
                initializeGamePage();
                break;
            case 'result':
                console.log('initializePage: Calling initializeResultPage');
                initializeResultPage();
                break;
            case 'learning':
                console.log('initializePage: Calling initializeLearningPage');
                initializeLearningPage(); // For the kamus/dictionary page
                break;
            default:
                console.warn('initializePage: Unknown page:', currentPage);
                // Default initialization or error - maybe just add global listeners
                break;
        }

        // Global listeners that apply to all pages
        if (themeToggleButton) {
            // Remove existing listener if any before adding
            themeToggleButton.removeEventListener('click', toggleTheme);
            themeToggleButton.addEventListener('click', toggleTheme);
        }
        // Add other global listeners here (e.g., navigation buttons in header/footer)
    }

    function disableDataDependentFeatures() {
        console.warn('disableDataDependentFeatures: Data fetch failed or data is invalid. Disabling data-dependent features.');
        // Find and disable buttons/elements that require quiz data
        // This needs to target specific elements on potentially different pages
        const dataDependentElements = document.querySelectorAll(
            '.needs-quiz-data, ' + // Custom class you might add
            '.btn-script, ' + // Buttons on selectscript and learning pages
            '#start-game-button, ' + // Button on selectcategory page
            '.main-category-item input[type="checkbox"], ' + // Checkboxes on selectcategory page
            '.speak-button, ' + // Buttons on learning page (if they somehow remain)
            '.learning-char-item, ' + // Make learning items non-interactive if no data
            '#try-again-button, #new-categories-button' // Buttons on result page that need data access
        ); // Add specific selectors

        dataDependentElements.forEach(el => {
            if (el.tagName === 'A') { // Disable links by preventing default behavior
                el.style.pointerEvents = 'none'; // Prevent hover/click effects
                el.style.opacity = '0.6'; // Dim it
            } else if (el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.classList.contains('learning-char-item')) {
                el.disabled = true; // Disable buttons/inputs
                el.style.pointerEvents = 'none'; // Also disable clicks for non-button interactives
                el.style.opacity = '0.6'; // Dim interactive items
            }
        });

        const messageArea = document.getElementById('content-wrapper') || document.body; // Fallback
        if (messageArea) {
            // Check if message already exists
            if (!messageArea.querySelector('.error-message')) {
                const errorMessageDiv = document.createElement('div');
                errorMessageDiv.classList.add('error-message', 'card'); // Add card class for styling
                errorMessageDiv.textContent = 'Gagal memuat data aplikasi. Beberapa fitur mungkin tidak berfungsi. Silakan coba refresh halaman.';
                messageArea.prepend(errorMessageDiv); // Add message to the top
            }
        }
    }


    // --- Page Initialization Functions ---

    function initializeIndexPage() {
        console.log('initializeIndexPage: Index page specific setup.');
        // Buttons are already in HTML, just add listeners

        const startQuizButton = document.getElementById('start-quiz-button');
        const startLearningButton = document.getElementById('start-learning-button');

        if (startQuizButton) {
            // Remove previous listener if any before adding
            startQuizButton.removeEventListener('click', handleStartQuiz);
            startQuizButton.addEventListener('click', handleStartQuiz);
            console.log('initializeIndexPage: Start Quiz button listener added.');
        } else {
            console.warn('initializeIndexPage: Start Quiz button not found.');
        }

        if (startLearningButton) {
            // Remove previous listener if any before adding
            startLearningButton.removeEventListener('click', handleStartLearning);
            startLearningButton.addEventListener('click', handleStartLearning);
            console.log('initializeIndexPage: Start Learning button listener added.');
        } else {
            console.warn('initializeIndexPage: Start Learning button not found.');
        }

        // Index page doesn't display quizData content directly,
        // so no need to check quizData.length here for basic button functionality.
        // Data fetch runs in initializePage anyway.
    }

    // Handlers for Index page buttons
    function handleStartQuiz() {
        console.log('handleStartQuiz: Start Quiz button clicked. Navigating to selectscript.');
        // Clear any lingering state from previous sessions if starting fresh quiz flow
        localStorage.removeItem('selectedScript');
        localStorage.removeItem('selectedSubCategories');
        localStorage.removeItem('quizQuestions');
        localStorage.removeItem('currentQuestionIndex');
        localStorage.removeItem('score');
        localStorage.removeItem('incorrectAnswers');
        localStorage.removeItem('totalQuestions');
        navigateTo('selectscript');
    }

    function handleStartLearning() {
        console.log('handleStartLearning: Start Learning button clicked. Navigating to learning.');
        // Optionally set a default learning script or use the last one
        // localStorage.setItem('selectedLearningScript', 'hiragana'); // Example
        navigateTo('learning');
    }


    function initializeSelectScriptPage() {
        console.log('initializeSelectScriptPage: Select Script page specific setup.');

        // Add listeners to script selection buttons using event delegation on a parent
        const scriptButtonsContainer = document.querySelector('.button-group.vertical'); // Assuming the parent container
        if (scriptButtonsContainer && quizData.length > 0) { // Only add listeners if data is potentially available
            // Remove previous delegation listener if any
            // Need a robust way to remove previous delegated listener if initializePage runs multiple times
            // A simpler approach is to attach directly to each button if they are static
            const scriptSelectButtons = scriptButtonsContainer.querySelectorAll('.btn-script');
            if (scriptSelectButtons.length > 0) {
                scriptSelectButtons.forEach(button => {
                    // Check if listener was already added in a previous run
                    if (!button.dataset.listenerAdded) {
                        const scriptKey = button.dataset.script;
                        button.addEventListener('click', () => {
                            console.log('initializeSelectScriptPage: Script selected:', scriptKey);
                            localStorage.setItem('selectedScript', scriptKey);
                            // Clear subcategory and quiz state when selecting a new script
                            localStorage.removeItem('selectedSubCategories');
                            localStorage.removeItem('quizQuestions');
                            localStorage.removeItem('currentQuestionIndex');
                            localStorage.removeItem('score');
                            localStorage.removeItem('incorrectAnswers');
                            localStorage.removeItem('totalQuestions');
                            navigateTo('selectcategory'); // Navigate to category selection
                        });
                        button.dataset.listenerAdded = 'true'; // Mark as having listener
                        console.log(`initializeSelectScriptPage: Listener added for script button: ${scriptKey}`);
                    }
                });
                console.log('initializeSelectScriptPage: Script selection button listeners added.');
            } else {
                console.warn('initializeSelectScriptPage: No .btn-script buttons found within the container.');
            }

        } else if (quizData.length === 0) {
            console.warn('initializeSelectScriptPage: No quiz data loaded, script selection buttons may be disabled.');
            // disableDataDependentFeatures already called by main initializer
        }

        // Back link works via its href="{{ url('/index') }}"
    }


    function initializeSelectCategoryPage() {
        console.log('initializeSelectCategoryPage: Select Category page specific setup.');

        // Load and render categories based on selected script and fetched data
        // This function checks for quizData availability internally
        loadCategories();

        // Add listener for subcategory checkboxes using event delegation
        const mainCategoryContainer = document.getElementById('main-category-container') || document.querySelector('.category-accordion');
        if (mainCategoryContainer) {
            // Remove previous delegation listener if necessary (if init runs multiple times)
            // A robust way is needed here, but for typical single page app flow it's okay.
            // Assuming this runs only once per page load.
            mainCategoryContainer.addEventListener('change', (event) => {
                if (event.target.type === 'checkbox' && event.target.name === 'subcategory') {
                    const value = event.target.value; // Format: "mainKey:subKey"
                    console.log('initializeSelectCategoryPage: Checkbox changed:', value, 'checked:', event.target.checked);
                    if (event.target.checked) {
                        if (!selectedSubCategories.includes(value)) {
                            selectedSubCategories.push(value);
                        }
                    } else {
                        selectedSubCategories = selectedSubCategories.filter(item => item !== value);
                    }
                    console.log('initializeSelectCategoryPage: Updated selected Subcategories:', selectedSubCategories);
                    localStorage.setItem('selectedSubCategories', JSON.stringify(selectedSubCategories));

                    // Enable/disable start button based on selection
                    const startGameButton = document.getElementById('start-game-button');
                    if (startGameButton) {
                        startGameButton.disabled = selectedSubCategories.length === 0;
                        console.log('initializeSelectCategoryPage: Start game button disabled state:', startGameButton.disabled);
                    }
                }
            });
            console.log('initializeSelectCategoryPage: Subcategory checkbox listener added via delegation.');
        } else {
            console.warn('initializeSelectCategoryPage: Main category container not found, checkbox listener not attached.');
            // disableDataDependentFeatures already called if data fetch failed
        }


        // Add listener for start game button
        const startGameButton = document.getElementById('start-game-button');
        if (startGameButton) {
            // Remove previous listener if any
            startGameButton.removeEventListener('click', handleStartGame);
            startGameButton.addEventListener('click', handleStartGame);
            console.log('initializeSelectCategoryPage: Start game button listener added.');
        } else {
            console.warn('initializeSelectCategoryPage: Start game button not found.');
            // disableDataDependentFeatures already called if data fetch failed
        }

        // Back link works via its href="{{ url('/selectscript') }}"
    }

    // Handler for Start Game button on selectcategory page
    function handleStartGame() {
        console.log('handleStartGame: Start game button clicked');
        if (selectedSubCategories.length > 0) {
            console.log('handleStartGame: Selected subcategories found. Preparing questions...');
            // Prepare questions and check if any were generated
            const questionsPrepared = prepareQuizQuestions(); // This populates global quizQuestions and saves to localStorage
            console.log('handleStartGame: prepareQuizQuestions returned:', questionsPrepared);
            if (questionsPrepared) {
                // Reset quiz state variables in JS memory for the new game
                score = 0; incorrectAnswers = 0; currentQuestionIndex = 0;
                // The values are already saved to localStorage in prepareQuizQuestions
                // displayQuestion will load them.

                navigateTo('game'); // Navigate to game page
            } else {
                // prepareQuizQuestions would have already shown a notification if no questions were found
                console.warn('handleStartGame: Quiz preparation failed or resulted in zero questions.');
            }
        } else {
            console.warn('handleStartGame: No subcategories selected.');
            showNotification('Pilih minimal satu subkategori untuk memulai game.', 3000);
        }
    }


    function initializeGamePage() {
        console.log('initializeGamePage: Game page specific setup.');

        // Load quiz state from localStorage
        quizQuestions = JSON.parse(localStorage.getItem('quizQuestions') || '[]');
        score = parseInt(localStorage.getItem('score') || '0');
        incorrectAnswers = parseInt(localStorage.getItem('incorrectAnswers') || '0');
        currentQuestionIndex = parseInt(localStorage.getItem('currentQuestionIndex') || '0');

        console.log(`initializeGamePage: Loaded state - questions: ${quizQuestions.length}, index: ${currentQuestionIndex}, score: ${score}`);


        if (quizQuestions.length === 0) {
            console.warn('initializeGamePage: No quiz questions found in localStorage. Attempting to re-prepare based on last selection.');
            // Attempt to prepare questions again based on last selections if quizData is available
            const selectedScript = localStorage.getItem('selectedScript');
            const selectedSubCategories = JSON.parse(localStorage.getItem('selectedSubCategories') || '[]');

            if (selectedScript && selectedSubCategories.length > 0 && quizData.length > 0) {
                console.log('initializeGamePage: Found script and categories. Re-preparing...');
                // prepareQuizQuestions populates global quizQuestions and saves to localStorage
                const questionsPrepared = prepareQuizQuestions();
                if (questionsPrepared) {
                    // Reload state from localStorage after preparing
                    quizQuestions = JSON.parse(localStorage.getItem('quizQuestions') || '[]');
                    // Reset score/index for a fresh game start if we had to re-prepare
                    score = 0; incorrectAnswers = 0; currentQuestionIndex = 0;
                    localStorage.setItem('score', score);
                    localStorage.setItem('incorrectAnswers', incorrectAnswers);
                    localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
                    console.log('initializeGamePage: Quiz questions re-prepared and state reset.');

                } else {
                    console.error('initializeGamePage: Cannot prepare quiz questions: preparation failed.');
                    showNotification('Gagal memuat soal quiz.', 4000);
                    navigateTo('selectscript'); // Redirect if cannot prepare
                    return; // Stop initialization
                }
            } else {
                console.error('initializeGamePage: Cannot prepare quiz questions: missing script selection, subcategories, or quiz data.');
                showNotification('Tidak ada soal yang disiapkan. Silakan pilih skrip dan kategori lagi.', 4000);
                navigateTo('selectscript'); // Redirect if cannot prepare
                return; // Stop initialization
            }
        }

        if (quizQuestions.length === 0) {
            console.error('initializeGamePage: Failed to load or prepare quiz questions.');
            showNotification('Gagal memuat soal quiz.', 4000);
            navigateTo('selectscript'); // Redirect if still no questions
            return; // Stop initialization
        }

        // Display the current question
        displayQuestion();

        // Add listener for quit game button
        const quitGameButton = document.getElementById('quit-game-button');
        if (quitGameButton) {
            // Remove previous listener if any
            quitGameButton.removeEventListener('click', handleQuitGame);
            quitGameButton.addEventListener('click', handleQuitGame);
            console.log('initializeGamePage: Quit game button listener added.');
        } else {
            console.warn('initializeGamePage: Quit game button not found.');
        }

        // Add listener for skip button if it exists (needs to be in HTML)
        const skipButton = document.getElementById('skip-button');
        if (skipButton) {
            // Remove previous listener if any
            skipButton.removeEventListener('click', handleSkip);
            skipButton.addEventListener('click', handleSkip);
            console.log('initializeGamePage: Skip button listener added.');
        } else {
            console.warn('initializeGamePage: Skip button not found.');
            // Consider showing a notification if skip functionality is essential
        }

    }

    // Handler for Quit Game button on game page
    function handleQuitGame() {
        console.log('handleQuitGame: Quiz quit by user.');
        // Optionally save progress before quitting (depends on desired behavior)
        localStorage.setItem('score', score);
        localStorage.setItem('incorrectAnswers', incorrectAnswers);
        localStorage.setItem('totalQuestions', quizQuestions.length); // Save total questions possible for this quiz
        localStorage.setItem('currentQuestionIndex', currentQuestionIndex); // Save progress up to this point

        // Clear temporary quiz state? Or leave it so results page can show partial?
        // Let's navigate to results page to show partial results
        showNotification('Quiz dihentikan.', 2000);
        navigateTo('result'); // Navigate to result page
        // The result page will pick up the state from localStorage
    }


    function initializeResultPage() {
        console.log('initializeResultPage: Result page specific setup.');
        showResults(); // Display the results using data from localStorage

        // Add listeners for result page buttons
        const tryAgainButton = document.getElementById('try-again-button'); // Corresponds to Blade ID
        const newCategoriesButton = document.getElementById('new-categories-button'); // Corresponds to Blade ID
        const homeButton = document.getElementById('home-button'); // Corresponds to Blade ID

        if (tryAgainButton) {
            tryAgainButton.removeEventListener('click', handleTryAgain);
            tryAgainButton.addEventListener('click', handleTryAgain);
            console.log('initializeResultPage: Try Again button listener added.');
        } else {
            console.warn('initializeResultPage: Try Again button not found.');
        }

        if (newCategoriesButton) {
            newCategoriesButton.removeEventListener('click', handleNewCategories);
            newCategoriesButton.addEventListener('click', handleNewCategories);
            console.log('initializeResultPage: New Categories button listener added.');
        } else {
            console.warn('initializeResultPage: New Categories button not found.');
        }

        if (homeButton) {
            homeButton.removeEventListener('click', handleGoHome);
            homeButton.addEventListener('click', handleGoHome);
            console.log('initializeResultPage: Home button listener added.');
        } else {
            console.warn('initializeResultPage: Home button not found.');
        }
    }

    // Handlers for Result page buttons
    function handleTryAgain() {
        console.log('handleTryAgain: Try Again clicked.');
        // Clear previous game *run* state (score, index) but KEEP quizQuestions
        localStorage.removeItem('currentQuestionIndex');
        localStorage.removeItem('score');
        localStorage.removeItem('incorrectAnswers');
        // Total questions can be kept or recalculated

        // Navigate back to the game page to start the same quiz again
        navigateTo('game');
    }

    function handleNewCategories() {
        console.log('handleNewCategories: Select New Categories clicked.');
        // Clear all quiz-specific state related to the *current* quiz selection
        localStorage.removeItem('quizQuestions');
        localStorage.removeItem('currentQuestionIndex');
        localStorage.removeItem('score');
        localStorage.removeItem('incorrectAnswers');
        localStorage.removeItem('totalQuestions');
        // Keep selectedScript, but clear selectedSubCategories to force re-selection
        localStorage.removeItem('selectedSubCategories');

        // Navigate back to category selection for the current script
        navigateTo('selectcategory');
    }

    function handleGoHome() {
        console.log('handleGoHome: Home button clicked.');
        // Clear all quiz state, including script/category selections
        localStorage.removeItem('quizQuestions');
        localStorage.removeItem('currentQuestionIndex');
        localStorage.removeItem('score');
        localStorage.removeItem('incorrectAnswers');
        localStorage.removeItem('totalQuestions');
        localStorage.removeItem('selectedScript');
        localStorage.removeItem('selectedSubCategories');
        localStorage.removeItem('selectedLearningScript'); // Also clear learning state

        navigateTo('index'); // Navigate back to the home page
    }


    function initializeLearningPage() {
        console.log('initializeLearningPage: Learning page specific setup.');

        // Initialize Speech Synthesis
        initializeSpeechSynthesis(); // Needs to be done on a user interaction or DOMContentLoaded

        // Get selected script for learning
        // Prioritize learning-specific selection, then quiz selection, then default
        currentLearningScript = localStorage.getItem('selectedLearningScript') || localStorage.getItem('selectedScript') || 'hiragana';
        console.log('initializeLearningPage: Current learning script:', currentLearningScript);

        // Load and display the learning data for the selected script
        // This function checks for quizData availability internally
        loadLearningData(currentLearningScript);

        // Add listeners for script selection buttons in the tabs
        const scriptTabsContainer = document.querySelector('.script-tabs');
        if (scriptTabsContainer && quizData.length > 0) { // Only add listeners if buttons exist and data is available
            const learningScriptButtons = scriptTabsContainer.querySelectorAll('.btn-script');
            if (learningScriptButtons.length > 0) {
                learningScriptButtons.forEach(button => {
                    // Check if listener was already added
                    if (!button.dataset.listenerAdded) {
                        const scriptKey = button.dataset.script;
                        button.addEventListener('click', () => {
                            console.log('initializeLearningPage: Learning script selected via tab:', scriptKey);
                            localStorage.setItem('selectedLearningScript', scriptKey);
                            currentLearningScript = scriptKey;
                            loadLearningData(currentLearningScript); // Load data for the newly selected script
                            // The loadLearningData function also updates the active class on tabs
                        });
                        button.dataset.listenerAdded = 'true'; // Mark as having listener
                        console.log(`initializeLearningPage: Listener added for learning script button: ${scriptKey}`);
                    }
                });
                console.log('initializeLearningPage: Learning script selection button listeners added.');
            } else {
                console.warn('initializeLearningPage: No .btn-script buttons found within the script tabs container.');
            }

        } else if (quizData.length === 0) {
            console.warn('initializeLearningPage: No quiz data loaded, learning script selection buttons may be disabled.');
            // disableDataDependentFeatures already called by main initializer
        }


        // Back link works via its href="{{ url('/index') }}"
    }


    // --- Initial Load ---
    // Call the main initializer when the DOM is ready
    console.log('DOM fully loaded. Initializing page...');
    initializePage();

}); // End of DOMContentLoaded listener