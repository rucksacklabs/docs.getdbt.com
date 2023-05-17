// This component is used to build the functionality of the quickstart guides
// Each H2 (##) in the markdown file is a step in the guide

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import style from "./styles.module.css";
import { useLocation } from "@docusaurus/router";

function QuickstartTOC() {
  const location = useLocation().pathname;
  const activeStepLocal = typeof localStorage !== "undefined" ? localStorage.getItem(location) : null;

  const [mounted, setMounted] = useState(false);
  const [tocData, setTocData] = useState([]);
  const [activeStep, setActiveStep] = useState(activeStepLocal);
  const [activeQuickstart, setActiveQuickstart] = useState(location);

  useEffect(() => {
    // Get all h2 for each step in the guide
    const quickstartContainer = document.querySelector(".quickstart-container");
    const steps = quickstartContainer.querySelectorAll("h2");
    const snippetContainer = document.querySelectorAll(".snippet");

    // Add snippet container to its parent step
    snippetContainer.forEach((snippet) => {
      const parent = snippet?.parentNode;
      console.log(parent)
      while (snippet?.firstChild && parent.className) {
        if (parent) {
          parent.insertBefore(snippet.firstChild, snippet);
        }
      }
    });

    // Create an array of objects with the id and title of each step
    const data = Array.from(steps).map((step, index) => ({
      id: step.id,
      title: step.innerText,
      stepNumber: index,
    }));

    setTocData(data);
    setMounted(true);
    setActiveStep(parseInt(activeStepLocal) || 0);

    // Wrap all h2 (steps), along with all of their direct siblings, in a div until the next h2
    if (mounted) {
      steps.forEach((step, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add(style.stepWrapper);
        wrapper.classList.add(style.hidden);

        // Move the step and all its siblings into the its own div
        step.parentNode.insertBefore(wrapper, step);
        let currentElement = step;
        do {
          const nextElement = currentElement.nextElementSibling;
          wrapper.appendChild(currentElement);
          currentElement = nextElement;
          wrapper.setAttribute("data-step", index);
        } while (currentElement && currentElement.tagName !== "H2");
      });

      // Find the acvtive step and show it
      const activeStepWrapper = document.querySelector(
        `.${style.stepWrapper}[data-step="${activeStep}"]`
      );
      activeStepWrapper?.classList.remove(style.hidden);
    }

    // Add Next/Prev buttons to step-wrapper divs
    if (mounted) {
      const stepWrappers = document.querySelectorAll(`.${style.stepWrapper}`);

      stepWrappers.forEach((stepWrapper, index) => {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add(style.buttonContainer);
        const prevButton = document.createElement("a");
        const nextButton = document.createElement("a");

        prevButton.textContent = "Back";
        prevButton.classList.add(clsx(style.button, style.prevButton));
        prevButton.disabled = index === 0;
        prevButton.addEventListener("click", () => handlePrev(index));

        nextButton.textContent = "Next";
        nextButton.classList.add(clsx(style.button, style.nextButton));
        nextButton.disabled = index === stepWrappers.length - 1;
        nextButton.addEventListener("click", () => handleNext(index));

        buttonContainer.appendChild(prevButton);
        buttonContainer.appendChild(nextButton);

        stepWrapper.appendChild(buttonContainer);

        // Hide the respective buttons on the first and last steps
        if (index === 0) {
          prevButton.classList.add(style.hidden);
        }
        if (index === stepWrappers.length - 1) {
          nextButton.classList.add(style.hidden);
        }
      });

      const quickstartTitle = document.querySelector("header h1");
      quickstartTitle.classList.add(style.quickstartTitle);
    }
  }, [mounted]);

  useEffect(() => {
    const tocItems = document.querySelectorAll(`.${style.tocItem}`);

    tocItems.forEach((item, i) => {
      const isActive = i <= activeStep;

      item.classList.toggle(clsx(style.active), isActive);
    });

    // Scroll to the top of the page when the user clicks next
    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
    }

    // Set local storage to the active step
    localStorage.setItem(activeQuickstart, activeStep);

    // If on mobile, auto scroll to the active step in the TOC when activeStep updates
    const tocList = document.querySelector(`.${style.tocList}`);
    const activeItems = document.querySelectorAll(`.${style.active}`);
    
    if (window.innerWidth < 996) {
      const activeItem = activeItems[activeItems.length - 1];
      
      if (activeItem) {
        const itemTop = activeItem.offsetTop;
        const itemHeight = activeItem.offsetHeight;
        const containerTop = tocList.scrollTop;
        const containerHeight = tocList.offsetHeight;
    
        if (itemTop < containerTop || itemTop + itemHeight > containerTop + containerHeight) {
          tocList.scrollTop = itemTop;
        }
      }
    }
  }, [activeStep]);

  // Handle updating the active step
  const updateStep = (currentStepIndex, newStepIndex) => {
    const currentStep = document.querySelector(
      `.${style.stepWrapper}[data-step='${currentStepIndex}']`
    );
    const newStep = document.querySelector(
      `.${style.stepWrapper}[data-step='${newStepIndex}']`
    );

    currentStep?.classList.add(style.hidden);
    newStep?.classList.remove(style.hidden);

    setActiveStep(newStepIndex);
  };

  const handleNext = (currentStepIndex) => {
    if (currentStepIndex < tocData.length - 1) {
      updateStep(currentStepIndex, currentStepIndex + 1);
    }
  };

  const handlePrev = (currentStepIndex) => {
    if (currentStepIndex > 0) {
      updateStep(currentStepIndex, currentStepIndex - 1);
    }
  };

  // Handle TOC click
  const handleTocClick = (e) => {
    const stepNumber = parseInt(e.target.dataset.step);

    const currentStep = document.querySelector(`.${style.stepWrapper}:not(.${style.hidden})`);
    currentStep?.classList.add(style.hidden);

    const newStep = document.querySelector(
      `.${style.stepWrapper}[data-step='${stepNumber}']`
    );
    newStep?.classList.remove(style.hidden);

    setActiveStep(stepNumber);
  };

  return (
    <ul className={style.tocList}>
      {tocData.map((step, index) => (
        <li
          key={step.id}
          data-step={index}
          className={clsx(style.tocItem)}
          onClick={handleTocClick}
        >
          <span>{step.stepNumber + 1}</span> {step.title}
        </li>
      ))}
    </ul>
  );
}

export default QuickstartTOC;
