'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[260px] rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  React.useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== value) editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
  }, [value, editor])

  if (!editor) return null

  const toolbarButton = (label: string, active: boolean, onClick: () => void) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(active ? 'border-[var(--color-clay)]' : '')}
      onClick={onClick}
    >
      {label}
    </Button>
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {toolbarButton('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
        {toolbarButton('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
        {toolbarButton('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {toolbarButton('UL', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
        {toolbarButton('OL', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
        {toolbarButton('Quote', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run())}
        {toolbarButton('Code', editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run())}
        <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          Clear
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
