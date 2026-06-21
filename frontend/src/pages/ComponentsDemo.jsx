/**
 * ComponentsDemo — Showcase page demonstrating all reusable UI components.
 *
 * This page visually demonstrates every component from the UI library:
 * - Button (primary, secondary, outline variants)
 * - Input (with label, placeholder, different types)
 * - Modal (open/close functionality)
 * - Toast (success and error variants)
 * - Loader (all three sizes)
 *
 * Route: /components-demo
 */
import { useState } from 'react'
import { Button, Input, Modal, Toast, Loader } from '../components/ui'

export default function ComponentsDemo() {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)

  // Toast states
  const [successToast, setSuccessToast] = useState(false)
  const [errorToast, setErrorToast] = useState(false)

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold tracking-wider uppercase mb-4 dark:bg-primary-900/30 dark:text-primary-400">
            Week 3 — UI Library
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white">
            Component{' '}
            <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Showcase
            </span>
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            All reusable UI components built for the StayWise design system. Each component supports dark mode, responsive layouts, and smooth animations.
          </p>
        </div>

        {/* ─────────────── BUTTON SECTION ─────────────── */}
        <div className="mb-14">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
            🎨 Button Component
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Three variants — primary, secondary, and outline. Supports hover, focus, active, and disabled states.
          </p>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 p-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" onClick={() => alert('Primary clicked!')}>
                Primary Button
              </Button>
              <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
                Secondary Button
              </Button>
              <Button variant="outline" onClick={() => alert('Outline clicked!')}>
                Outline Button
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>

            {/* Code hint */}
            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-gray-700 p-4">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {'<Button variant="primary" onClick={handler}>Label</Button>'}
              </code>
            </div>
          </div>
        </div>

        {/* ─────────────── INPUT SECTION ─────────────── */}
        <div className="mb-14">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
            📝 Input Component
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Labeled input fields with responsive width, placeholder support, and multiple input types.
          </p>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <Input label="Full Name" placeholder="Enter your name" />
              <Input label="Email Address" placeholder="you@example.com" type="email" />
              <Input label="Password" placeholder="••••••••" type="password" />
              <Input label="Homestay Name" placeholder="Mountain View Cottage" />
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-gray-700 p-4">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {'<Input label="Email" placeholder="you@example.com" type="email" />'}
              </code>
            </div>
          </div>
        </div>

        {/* ─────────────── MODAL SECTION ─────────────── */}
        <div className="mb-14">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
            🪟 Modal Component
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Overlay modal dialog with backdrop blur, title header, close button, and click-outside-to-dismiss.
          </p>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 p-8">
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>

            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="AI Review Response"
            >
              <p className="mb-4">
                Our AI has generated the following reply for the guest review. You can edit it before publishing.
              </p>
              <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 p-4 text-sm">
                "Thank you for your wonderful review! We are delighted that you enjoyed your stay at our homestay.
                Your feedback about the breakfast is truly appreciated. We look forward to welcoming you back!"
              </div>
              <div className="flex items-center gap-3 mt-5">
                <Button variant="primary" onClick={() => setModalOpen(false)}>
                  Approve & Send
                </Button>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Edit Response
                </Button>
              </div>
            </Modal>

            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-gray-700 p-4">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {'<Modal isOpen={open} onClose={close} title="Title">Content</Modal>'}
              </code>
            </div>
          </div>
        </div>

        {/* ─────────────── TOAST SECTION ─────────────── */}
        <div className="mb-14">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
            🔔 Toast Component
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Notification toasts with success and error variants. Auto-hides after 3 seconds.
          </p>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 p-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" onClick={() => setSuccessToast(true)}>
                Show Success Toast
              </Button>
              <Button variant="outline" onClick={() => setErrorToast(true)}>
                Show Error Toast
              </Button>
            </div>

            {/* Toast instances */}
            <Toast
              message="Review response published successfully!"
              variant="success"
              isVisible={successToast}
              onClose={() => setSuccessToast(false)}
            />
            <Toast
              message="Failed to connect to the review platform."
              variant="error"
              isVisible={errorToast}
              onClose={() => setErrorToast(false)}
            />

            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-gray-700 p-4">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {'<Toast message="Saved!" variant="success" isVisible={show} onClose={hide} />'}
              </code>
            </div>
          </div>
        </div>

        {/* ─────────────── LOADER SECTION ─────────────── */}
        <div className="mb-14">
          <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
            ⏳ Loader Component
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Animated loading spinner in three sizes — small, medium, and large.
          </p>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800 p-8">
            <div className="flex items-end gap-10">
              <div className="text-center">
                <Loader size="sm" />
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">Small</p>
              </div>
              <div className="text-center">
                <Loader size="md" />
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">Medium</p>
              </div>
              <div className="text-center">
                <Loader size="lg" />
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">Large</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-gray-700 p-4">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {'<Loader size="md" />'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
