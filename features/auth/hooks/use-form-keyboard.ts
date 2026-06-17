"use client"

import { useEffect } from "react"

type UseFormKeyboardOptions = {
  formId: string
  onEscape?: () => void
}

export function useFormKeyboard({ formId, onEscape }: UseFormKeyboardOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.metaKey) {
        return
      }

      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const form = document.getElementById(formId)
      if (!form || !form.contains(target)) return

      if (target.tagName === "TEXTAREA") return

      const submitButton =
        form.querySelector<HTMLButtonElement>(
          'button[type="button"][data-form-submit="true"]:not([disabled])',
        ) ??
        document.querySelector<HTMLButtonElement>(
          `button[type="button"][data-form-submit="true"][form="${formId}"]:not([disabled])`,
        )
      if (!submitButton) return

      event.preventDefault()
      submitButton.click()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [formId, onEscape])
}
