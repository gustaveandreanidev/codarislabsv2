/**
 * ============================================
 * CODARIS - Script principal
 * ============================================
 * Gestion de toutes les interactions et animations
 */

// ============================================
// MENU LATÉRAL (Side Menu)
// ============================================
(function initSideMenu() {
    const openMenu = document.getElementById("openMenu");
    const closeMenu = document.getElementById("closeMenu");
    const sideMenu = document.getElementById("sideMenu");
    
    if (!openMenu || !closeMenu || !sideMenu) return;

    const menuOverlay = document.getElementById("menuOverlay");
    const carouselItems = Array.from(sideMenu.querySelectorAll(".carousel-item"));

    function openSideMenu() {
        sideMenu.classList.add("open");
        sideMenu.setAttribute("aria-hidden", "false");
        openMenu.setAttribute("aria-expanded", "true");
        if (menuOverlay) {
            menuOverlay.classList.add("active");
            menuOverlay.setAttribute("aria-hidden", "false");
        }
        document.body.style.overflow = "hidden";
        
        // Réinitialiser et animer les positions du carousel
        setTimeout(() => {
            // Déclencher la mise à jour des positions du carousel
            const carousel = document.getElementById("carousel");
            if (carousel) {
                const updateEvent = new Event('carouselUpdate');
                carousel.dispatchEvent(updateEvent);
            }
            
            // Animation d'entrée des items avec GSAP
            if (typeof gsap !== "undefined" && carouselItems.length > 0) {
                // D'abord positionner les items correctement
                const carouselRect = carousel.getBoundingClientRect();
                const centerY = carouselRect.height / 2;
                const itemHeight = 80;
                const spacing = 20;
                
                carouselItems.forEach((item, i) => {
                    const distance = i - 0;
                    const yPosition = centerY + (distance * (itemHeight + spacing)) - (itemHeight / 2);
                    const scale = Math.max(0.5, 1 - (Math.abs(distance) * 0.15));
                    const opacity = Math.max(0.3, 1 - (Math.abs(distance) * 0.2));
                    
                    gsap.set(item, {
                        x: 100,
                        y: yPosition - centerY,
                        scale: scale,
                        opacity: 0
                    });
                });
                
                // Puis animer l'entrée
                gsap.to(carouselItems, {
                    x: 0,
                    opacity: (index, target) => {
                        const distance = Math.abs(index - 0);
                        return Math.max(0.3, 1 - (distance * 0.2));
                    },
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.1,
                    delay: 0.3
                });
            }
        }, 100);
        
        // Focus sur le premier élément du menu
        setTimeout(() => {
            const firstItem = sideMenu.querySelector(".carousel-item");
            if (firstItem) firstItem.focus();
        }, 500);
    }

    function closeSideMenu() {
        // Animation de fermeture des items
        if (typeof gsap !== "undefined" && carouselItems.length > 0) {
            gsap.to(carouselItems, {
                opacity: 0,
                x: 50,
                duration: 0.3,
                ease: "power2.in",
                stagger: 0.05,
                onComplete: () => {
                    sideMenu.classList.remove("open");
                    sideMenu.setAttribute("aria-hidden", "true");
                    if (menuOverlay) {
                        menuOverlay.classList.remove("active");
                        menuOverlay.setAttribute("aria-hidden", "true");
                    }
                    document.body.style.overflow = "";
                    openMenu.setAttribute("aria-expanded", "false");
                    openMenu.focus();
                }
            });
        } else {
            // Fallback sans GSAP
            carouselItems.forEach((item) => {
                item.style.opacity = "0";
                item.style.transform = "translateX(50px)";
            });
            setTimeout(() => {
                sideMenu.classList.remove("open");
                sideMenu.setAttribute("aria-hidden", "true");
                if (menuOverlay) {
                    menuOverlay.classList.remove("active");
                    menuOverlay.setAttribute("aria-hidden", "true");
                }
                document.body.style.overflow = "";
                openMenu.setAttribute("aria-expanded", "false");
                openMenu.focus();
            }, 300);
        }
    }

    openMenu.addEventListener("click", openSideMenu);
    closeMenu.addEventListener("click", closeSideMenu);

    // Fermeture avec ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sideMenu.classList.contains("open")) {
            closeSideMenu();
        }
    });

    // Fermeture en cliquant sur l'overlay
    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeSideMenu);
    }
})();

// ============================================
// CAROUSEL VERTICAL DU MENU
// ============================================
(function initMenuCarousel() {
    const carousel = document.getElementById("carousel");
    const items = Array.from(document.querySelectorAll(".carousel-item"));
    
    if (!carousel || items.length === 0) return;

    let index = 0;
    let isScrolling = false;
    
    // Configuration du carousel
    const itemHeight = 80; // Hauteur de base d'un item
    const spacing = 20; // Espacement entre les items

    // Déterminer l'index initial en fonction de la section visible
    function getCurrentSectionIndex() {
        const sections = ['home', 'projects', 'approach', 'expertises', 'contact'];
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && section.offsetTop <= scrollPosition) {
                return i;
            }
        }
        return 0;
    }
    
    index = getCurrentSectionIndex();

    function updateCarouselPositions() {
        const carouselRect = carousel.getBoundingClientRect();
        const centerY = carouselRect.height / 2;
        
        items.forEach((item, i) => {
            const distance = i - index;
            const isActive = distance === 0;
            
            // Calculer la position Y (l'item actif reste au centre)
            const yPosition = centerY + (distance * (itemHeight + spacing)) - (itemHeight / 2);
            
            // Calculer le scale en fonction de la distance (plus loin = plus petit)
            const maxDistance = Math.max(index, items.length - 1 - index);
            const scale = Math.max(0.5, 1 - (Math.abs(distance) * 0.15));
            
            // Calculer l'opacity en fonction de la distance
            const opacity = Math.max(0.3, 1 - (Math.abs(distance) * 0.2));
            
            // Mettre à jour les classes
            item.classList.toggle("active", isActive);
            
            // Animer avec GSAP si disponible
            if (typeof gsap !== "undefined") {
                gsap.to(item, {
                    y: yPosition - centerY,
                    scale: scale,
                    opacity: opacity,
                    x: 0, // Garder le centrage horizontal
                    duration: 0.6,
                    ease: "power3.out"
                });
            } else {
                // Fallback CSS
                item.style.transform = `translate(-50%, ${yPosition - centerY}px) scale(${scale})`;
                item.style.opacity = opacity;
            }
        });
    }

    function setActiveItem(newIndex) {
        index = (newIndex + items.length) % items.length;
        updateCarouselPositions();
    }
    
    // Initialiser les positions au chargement
    updateCarouselPositions();

    carousel.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (isScrolling) return;
        isScrolling = true;
        const direction = e.deltaY > 0 ? 1 : -1;
        setActiveItem(index + direction);
        setTimeout(() => { isScrolling = false; }, 400);
    });

    // Gestion du touch pour mobile
    let touchStartY = 0;
    let touchStartTime = 0;
    
    carousel.addEventListener("touchstart", (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
    }, { passive: true });

    carousel.addEventListener("touchmove", (e) => {
        // Laisser le scroll natif fonctionner pour un scroll fluide
    }, { passive: true });

    carousel.addEventListener("touchend", (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = performance.now();
        const deltaY = touchStartY - touchEndY;
        const deltaTime = touchEndTime - touchStartTime;
        const velocity = Math.abs(deltaY) / deltaTime;
        
        // Si le swipe est assez rapide et assez long, changer d'item
        if (velocity > 0.2 && Math.abs(deltaY) > 50) {
            if (isScrolling) return;
            isScrolling = true;
            const direction = deltaY > 0 ? 1 : -1;
            setActiveItem(index + direction);
            setTimeout(() => { isScrolling = false; }, 400);
        }
    }, { passive: true });
    
    // Écouter les événements de mise à jour du carousel
    carousel.addEventListener("carouselUpdate", updateCarouselPositions);
    
    // Mettre à jour les positions lors du redimensionnement
    window.addEventListener("resize", () => {
        if (carousel.closest(".side-menu.open")) {
            updateCarouselPositions();
        }
    });

    items.forEach((item, i) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            setActiveItem(i);
            const targetId = item.getAttribute("data-target");
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
                // Fermeture du menu après navigation
                const sideMenu = document.getElementById("sideMenu");
                const menuOverlay = document.getElementById("menuOverlay");
                if (sideMenu) {
                    // Utiliser la fonction de fermeture si elle existe
                    const closeSideMenu = () => {
                        sideMenu.classList.remove("open");
                        sideMenu.setAttribute("aria-hidden", "true");
                        if (menuOverlay) {
                            menuOverlay.classList.remove("active");
                            menuOverlay.setAttribute("aria-hidden", "true");
                        }
                        const openMenu = document.getElementById("openMenu");
                        if (openMenu) {
                            openMenu.setAttribute("aria-expanded", "false");
                        }
                        document.body.style.overflow = "";
                    };
                    closeSideMenu();
                }
            }
        });
    });
})();

// ============================================
// CAROUSEL PROJETS HORIZONTAL (GSAP)
// ============================================
(function initProjectsCarousel() {
    const projectsTrack = document.querySelector(".projects-track");
    const projectsScroller = document.querySelector(".projects-scroller");
    
    if (!projectsTrack || !projectsScroller || typeof gsap === "undefined") return;

    const projectsTween = gsap.to(projectsTrack, {
        xPercent: -50,
        repeat: -1,
        duration: 22,
        ease: "none"
    });

    projectsScroller.addEventListener("mouseenter", () => {
        projectsTween.timeScale(0.25);
    });

    projectsScroller.addEventListener("mouseleave", () => {
        projectsTween.timeScale(1);
    });
})();

// ============================================
// ANIMATION TYPEWRITER HERO
// ============================================
(function initTypewriter() {
    const heroTitle = document.getElementById("heroTitle");
    const heroSub = document.getElementById("heroSub");
    const heroCtas = document.getElementById("heroCtas");

    if (!heroTitle) return;

    const fullText = heroTitle.getAttribute("data-text") || heroTitle.textContent.trim();
    
    // Fallback si JS désactivé : le texte reste visible
    heroTitle.textContent = fullText;
    
    // On cache le sous-texte et les CTAs au début
    if (heroSub) heroSub.style.opacity = "0";
    if (heroCtas) {
        Array.from(heroCtas.children).forEach((btn) => {
            btn.style.opacity = "0";
        });
    }

    // Animation typewriter
    let indexChar = 0;
    const speed = 35; // ms par caractère

    function typeNext() {
        if (indexChar < fullText.length) {
            heroTitle.textContent = fullText.slice(0, indexChar + 1);
            indexChar++;
            setTimeout(typeNext, speed);
        } else {
            // Animation terminée : on supprime le curseur
            heroTitle.classList.add("typing-done");

            // Apparition du sous-texte et des CTAs
            if (heroSub && typeof gsap !== "undefined") {
                gsap.fromTo(
                    heroSub,
                    { opacity: 0, y: 12 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
            } else if (heroSub) {
                heroSub.style.opacity = "1";
            }

            if (heroCtas && typeof gsap !== "undefined") {
                gsap.fromTo(
                    heroCtas.children,
                    { opacity: 0, y: 16 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: "power2.out",
                        stagger: 0.1
                    }
                );
            } else if (heroCtas) {
                Array.from(heroCtas.children).forEach((btn) => {
                    btn.style.opacity = "1";
                });
            }

            // Démarrer l'animation de la flèche après un court délai
            setTimeout(() => {
                animateHeroArrow();
            }, 800);
        }
    }

    // Démarrage de l'animation
    heroTitle.textContent = "";
    typeNext();
})();

// ============================================
// ANIMATION FLÈCHE DE CONVERSION
// ============================================
function animateHeroArrow() {
    const heroArrow = document.getElementById("heroArrow");
    const arrowLine = document.getElementById("arrow-line");
    const arrowHeadGroup = document.getElementById("arrow-head-group");
    const arrowHead = document.getElementById("arrow-head");
    
    if (!heroArrow || !arrowLine || !arrowHeadGroup || !arrowHead) return;

    // Calculer la longueur réelle du path
    const lineLength = arrowLine.getTotalLength();
    const headLength = arrowHead.getTotalLength();

    // Calculer l'angle de la tangente à la fin de la courbe pour aligner la pointe
    const endPoint = arrowLine.getPointAtLength(lineLength);
    const pointBeforeEnd = arrowLine.getPointAtLength(Math.max(0, lineLength - 10));
    const angle = Math.atan2(endPoint.y - pointBeforeEnd.y, endPoint.x - pointBeforeEnd.x) * (180 / Math.PI);

    // Positionner et orienter la pointe de la flèche
    arrowHeadGroup.setAttribute("transform", `translate(${endPoint.x}, ${endPoint.y}) rotate(${angle})`);

    // Initialiser les paths avec stroke-dasharray et stroke-dashoffset
    arrowLine.style.strokeDasharray = lineLength;
    arrowLine.style.strokeDashoffset = lineLength;
    
    // Pour la pointe (forme fermée), on utilise juste l'opacity, pas stroke-dashoffset
    arrowHead.style.opacity = "0";
    arrowHead.style.visibility = "visible"; // S'assurer qu'elle est visible

    // Faire apparaître la flèche avec GSAP
    if (typeof gsap !== "undefined") {
        // Fade in de la flèche
        gsap.to(heroArrow, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                // Dessiner la ligne de bas en haut
                gsap.to(arrowLine, {
                    strokeDashoffset: 0,
                    duration: 1.5,
                    ease: "power2.out",
                    onComplete: () => {
                        // Faire apparaître la pointe de la flèche (simple fade-in)
                        gsap.to(arrowHead, {
                            opacity: 1,
                            duration: 0.6,
                            ease: "power2.out"
                        });
                    }
                });
            }
        });
    } else {
        // Fallback sans GSAP : utiliser les transitions CSS
        heroArrow.style.opacity = "1";
        setTimeout(() => {
            arrowLine.style.transition = "stroke-dashoffset 1.5s ease-out";
            arrowLine.style.strokeDashoffset = "0";
            setTimeout(() => {
                arrowHead.style.transition = "opacity 0.6s ease-out";
                arrowHead.style.opacity = "1";
            }, 1500);
        }, 500);
    }
}

// ============================================
// VALIDATION FORMULAIRE DE CONTACT
// ============================================
(function initContactForm() {
    // Initialiser EmailJS avec la clé publique au chargement
    if (typeof emailjs !== "undefined") {
        emailjs.init("JlVPdGZfHPDni3Yyp");
    }

    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const projectInput = document.getElementById("contact-project");
    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const projectError = document.getElementById("project-error");
    const formMessage = document.getElementById("formMessage");

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(input, errorElement, message) {
        input.classList.add("error");
        input.setAttribute("aria-invalid", "true");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
        }
    }

    function clearError(input, errorElement) {
        input.classList.remove("error");
        input.setAttribute("aria-invalid", "false");
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }
    }

    function validateField(input, errorElement) {
        const value = input.value.trim();
        
        if (input === nameInput) {
            if (!value) {
                showError(input, errorElement, "Le nom est requis");
                return false;
            }
        } else if (input === emailInput) {
            if (!value) {
                showError(input, errorElement, "L'email est requis");
                return false;
            } else if (!validateEmail(value)) {
                showError(input, errorElement, "Format d'email invalide");
                return false;
            }
        } else if (input === projectInput) {
            if (!value) {
                showError(input, errorElement, "La description du projet est requise");
                return false;
            }
        }
        
        clearError(input, errorElement);
        return true;
    }

    // Validation en temps réel
    [nameInput, emailInput, projectInput].forEach((input) => {
        if (!input) return;
        const errorElement = input === nameInput ? nameError : 
                            input === emailInput ? emailError : projectError;
        
        input.addEventListener("blur", () => {
            validateField(input, errorElement);
        });

        input.addEventListener("input", () => {
            if (input.classList.contains("error")) {
                validateField(input, errorElement);
            }
        });
    });

    // Soumission du formulaire
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Réinitialiser le message
        if (formMessage) {
            formMessage.textContent = "";
            formMessage.className = "form-message";
        }

        // Valider tous les champs
        const isNameValid = validateField(nameInput, nameError);
        const isEmailValid = validateField(emailInput, emailError);
        const isProjectValid = validateField(projectInput, projectError);

        if (isNameValid && isEmailValid && isProjectValid) {
            // Désactiver le bouton de soumission
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Envoi en cours...";

            // Préparer les données pour EmailJS
            const templateParams = {
                from_name: nameInput.value.trim(),
                from_email: emailInput.value.trim(),
                message: projectInput.value.trim()
            };

            // Envoyer l'email via EmailJS
            if (typeof emailjs !== "undefined") {
                emailjs.send("service_a2gwgj2", "template_sf64ist", templateParams)
                    .then(() => {
                        // Succès
                        if (formMessage) {
                            formMessage.textContent = "Merci, nous revenons vers vous rapidement.";
                            formMessage.className = "form-message form-message--success";
                        }
                        
                        // Réinitialiser le formulaire
                        form.reset();
                        [nameInput, emailInput, projectInput].forEach((input) => {
                            clearError(input, input === nameInput ? nameError : 
                                      input === emailInput ? emailError : projectError);
                        });

                        // Scroll vers le message de succès
                        if (formMessage) {
                            formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }
                    })
                    .catch((error) => {
                        // Erreur
                        console.error("Erreur EmailJS:", error);
                        if (formMessage) {
                            formMessage.textContent = "Une erreur s'est produite. Veuillez réessayer ou nous contacter directement.";
                            formMessage.className = "form-message form-message--error";
                        }
                        if (formMessage) {
                            formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }
                    })
                    .finally(() => {
                        // Réactiver le bouton
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    });
            } else {
                // Fallback si EmailJS n'est pas chargé
                console.error("EmailJS n'est pas chargé");
                if (formMessage) {
                    formMessage.textContent = "Une erreur s'est produite. Veuillez réessayer.";
                    formMessage.className = "form-message form-message--error";
                }
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        } else {
            // Focus sur le premier champ en erreur
            if (!isNameValid) nameInput.focus();
            else if (!isEmailValid) emailInput.focus();
            else if (!isProjectValid) projectInput.focus();
        }
    });
})();

// ============================================
// SCROLL REVEAL SECTIONS (GSAP)
// ============================================
(function initScrollReveal() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    // Enregistrer le plugin ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".section, .section-alt");
    if (sections.length === 0) return;

    sections.forEach((section) => {
        // Ne pas animer la section approach car elle a sa propre animation de timeline
        if (section.id === "approach") return;
        
        const sectionInner = section.querySelector(".section-inner");
        if (!sectionInner) return;

        gsap.fromTo(
            sectionInner,
            {
                opacity: 0,
                y: 20
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none none"
                }
            }
        );
    });
})();

// ============================================
// TIMELINE NOTRE APPROCHE - Animation au scroll
// ============================================
(function initApproachTimeline() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const approachSection = document.getElementById('approach');
    const timelineProgress = document.getElementById('timelineProgress');
    const steps = document.querySelectorAll('.approach-step');
    
    if (!approachSection || !timelineProgress || steps.length === 0) return;

    // Animation de la ligne de progression
    gsap.to(timelineProgress, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: approachSection,
            start: "top 80%",
            end: "bottom 10%",
            scrub: 1
        }
    });

    // Animation de chaque étape
    steps.forEach((step, index) => {
        const number = step.querySelector('.approach-step-number');
        const content = step.querySelector('.approach-step-content');
        
        // Animation d'apparition de l'étape - déclenchée beaucoup plus tôt
        gsap.fromTo(step,
            {
                opacity: 0,
                x: -40,
                scale: 0.95
            },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: step,
                    start: "top 120%",
                    toggleActions: "play none none none"
                },
                onComplete: () => {
                    step.classList.add('active');
                }
            }
        );

        // Point de timeline supprimé - pas d'animation nécessaire

        // Animation du numéro
        if (number) {
            gsap.fromTo(number,
                {
                    opacity: 0.3,
                    scale: 0.8
                },
                {
                    opacity: 1,
                    scale: 1.1,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: step,
                        start: "top 120%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // Animation du contenu
        if (content) {
            gsap.fromTo(content,
                {
                    opacity: 0.5
                },
                {
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: step,
                        start: "top 120%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }
    });
})();

// ============================================
// EXPERTISES - Deux carousels continus et automatiques
// ============================================
(function initExpertisesCarousels() {
    const expertisesSection = document.getElementById('expertises');
    if (!expertisesSection || typeof gsap === "undefined") return;

    const carouselForward = document.querySelector('.expertises-carousel--forward .expertises-track');
    const carouselReverse = document.querySelector('.expertises-carousel--reverse .expertises-track');
    
    if (!carouselForward || !carouselReverse) return;

    // Attendre que le DOM soit complètement rendu pour avoir les bonnes dimensions
    function initCarousels() {
        // Animation du premier carousel (droite à gauche) - infinie et fluide
        // On positionne le track à -50% initialement et on va vers 0%
        // Cela crée un mouvement de droite à gauche
        gsap.set(carouselForward, { xPercent: -50 });
        const forwardTween = gsap.to(carouselForward, {
            xPercent: 0,
            repeat: -1,
            duration: 40,
            ease: "none",
            immediateRender: false
        });

        // Animation du deuxième carousel (gauche à droite) - infinie et fluide
        // xPercent: -50 fonctionne car on a exactement 2 lots identiques (8 + 8 cartes = 16)
        // Le track fait 16 * 280px = 4480px, donc -50% = -2240px (8 cartes)
        // Quand on arrive à -50%, GSAP reset à 0%, mais visuellement c'est identique car les cartes sont dupliquées
        const reverseTween = gsap.to(carouselReverse, {
            xPercent: -50,
            repeat: -1,
            duration: 40,
            ease: "none",
            immediateRender: false
        });
    }

    // Initialiser après un court délai pour s'assurer que les dimensions sont calculées
    if (document.readyState === 'complete') {
        setTimeout(initCarousels, 100);
    } else {
        window.addEventListener('load', () => {
            setTimeout(initCarousels, 100);
        });
    }
})();

// ============================================
// SCROLL FLUIDE VERS LES ANCRES
// ============================================
(function initSmoothScroll() {
    // Sélectionner tous les liens d'ancrage
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignorer les liens vides ou vers #
            if (href === '#' || href === '') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Calculer immédiatement la position
                const navbarHeight = 0;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                const startPosition = window.pageYOffset || window.scrollY;
                const distance = targetPosition - startPosition;
                
                // Si la distance est très petite, scroll immédiat
                if (Math.abs(distance) < 10) {
                    window.scrollTo(0, targetPosition);
                    return;
                }
                
                // Démarrer l'animation immédiatement sans attendre
                const duration = 1000;
                const startTime = performance.now();
                
                function smoothScrollStep(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function ease-in-out (courbe douce)
                    const ease = progress < 0.5 
                        ? 2 * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    
                    const currentPosition = startPosition + distance * ease;
                    window.scrollTo(0, currentPosition);
                    
                    if (progress < 1) {
                        requestAnimationFrame(smoothScrollStep);
                    } else {
                        // S'assurer qu'on arrive exactement à la destination
                        window.scrollTo(0, targetPosition);
                    }
                }
                
                // Démarrer immédiatement sans délai
                requestAnimationFrame(smoothScrollStep);
            }
        }, { passive: false });
    });
})();

// ============================================
// FOOTER - Année automatique
// ============================================
(function initFooterYear() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
})();

