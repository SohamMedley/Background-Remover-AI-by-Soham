document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const uploadTrigger = document.getElementById("uploadTrigger")
  const uploadSection = document.getElementById("upload-section")
  const dropArea = document.getElementById("dropArea")
  const fileInput = document.getElementById("fileInput")
  const processingContainer = document.getElementById("processingContainer")
  const resultsContainer = document.getElementById("resultsContainer")
  const progressFill = document.getElementById("progressFill")
  const originalImage = document.getElementById("originalImage")
  const processedImage = document.getElementById("processedImage")
  const processingTime = document.getElementById("processingTime")
  const downloadButton = document.getElementById("downloadButton")
  const newImageButton = document.getElementById("newImageButton")

  // Scroll to upload section when CTA button is clicked
  uploadTrigger.addEventListener("click", () => {
    uploadSection.scrollIntoView({ behavior: "smooth" })
  })

  // File upload handling
  fileInput.addEventListener("change", handleFileSelect)

  // Drag and drop handling
  ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })

  function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }
  ;["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, highlight, false)
  })
  ;["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, unhighlight, false)
  })

  function highlight() {
    dropArea.classList.add("drag-over")
  }

  function unhighlight() {
    dropArea.classList.remove("drag-over")
  }

  dropArea.addEventListener("drop", handleDrop, false)

  function handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files

    if (files.length) {
      fileInput.files = files
      handleFileSelect()
    }
  }

  // Process the selected file
  function handleFileSelect() {
    if (!fileInput.files.length) return

    const file = fileInput.files[0]

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, or WEBP)")
      return
    }

    // Check file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
      alert("File size exceeds 16MB limit")
      return
    }

    // Show processing UI
    document.querySelector(".upload-container").classList.add("hidden")
    processingContainer.classList.remove("hidden")

    // Simulate progress
    simulateProgress()

    // Create FormData and send to server
    const formData = new FormData()
    formData.append("image", file)

    fetch("/remove-background", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          // Update UI with results
          originalImage.src = data.original
          processedImage.src = data.processed
          processingTime.textContent = data.processing_time

          // Fix download functionality
          downloadButton.addEventListener("click", (e) => {
            e.preventDefault()
            downloadProcessedImage(data.processed)
          })

          // Show results UI
          processingContainer.classList.add("hidden")
          resultsContainer.classList.remove("hidden")
        } else {
          throw new Error(data.error || "Unknown error occurred")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error processing image: " + error.message)
        resetUI()
      })
  }

  // Function to download the processed image
  function downloadProcessedImage(imageUrl) {
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = "background-removed.png"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      })
      .catch((error) => {
        console.error("Error downloading image:", error)
        alert("Error downloading image. Please try again.")
      })
  }

  // Simulate progress bar
  function simulateProgress() {
    let width = 0
    const interval = setInterval(() => {
      if (width >= 90) {
        clearInterval(interval)
      } else {
        width += Math.random() * 10
        progressFill.style.width = Math.min(width, 90) + "%"
      }
    }, 300)
  }

  // Reset UI to upload state
  function resetUI() {
    processingContainer.classList.add("hidden")
    resultsContainer.classList.add("hidden")
    document.querySelector(".upload-container").classList.remove("hidden")
    progressFill.style.width = "0%"
    fileInput.value = ""
  }

  // Process another image button
  newImageButton.addEventListener("click", resetUI)

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href")
      if (targetId === "#") return

      document.querySelector(targetId).scrollIntoView({
        behavior: "smooth",
      })
    })
  })

  // Animation on scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".feature-card, .about-content")

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top
      const windowHeight = window.innerHeight

      if (elementPosition < windowHeight - 100) {
        element.style.opacity = "1"
        element.style.transform = "translateY(0)"
      }
    })
  }

  // Initial styles for animation
  document.querySelectorAll(".feature-card, .about-content").forEach((element) => {
    element.style.opacity = "0"
    element.style.transform = "translateY(20px)"
    element.style.transition = "opacity 0.8s ease, transform 0.8s ease"
  })

  // Add scroll event listener
  window.addEventListener("scroll", animateOnScroll)

  // Initial check for elements in view
  animateOnScroll()
})

