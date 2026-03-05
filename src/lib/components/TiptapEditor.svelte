<script lang="ts">
	import { onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { Markdown } from 'tiptap-markdown';

	let {
		content = '',
		onupdate
	}: {
		content: string;
		onupdate?: (markdown: string) => void;
	} = $props();

	let editorElement: HTMLDivElement | null = $state(null);
	let editor: Editor | null = $state(null);

	onMount(() => {
		if (!editorElement) return;

		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit,
				Markdown.configure({
					html: false,
					transformCopiedText: true,
					transformPastedText: true
				})
			],
			content,
			editorProps: {
				attributes: {
					class:
						'prose prose-sm prose-invert prose-amber max-w-none focus:outline-none min-h-[200px] px-4 py-3'
				}
			},
			onUpdate: ({ editor: e }) => {
				const md = (e.storage as Record<string, any>).markdown.getMarkdown();
				onupdate?.(md);
			}
		});

		return () => {
			editor?.destroy();
		};
	});

	function isActive(name: string, attrs?: Record<string, unknown>): boolean {
		return editor?.isActive(name, attrs) ?? false;
	}

	function btn(active: boolean): string {
		return `rounded px-2 py-1 text-xs transition ${active ? 'tiptap-btn-active' : 'tiptap-btn'}`;
	}
</script>

<div
	class="overflow-hidden rounded"
	style="background: var(--bg-surface); border: 1px solid var(--border-color);"
>
	{#if editor}
		<div
			class="flex flex-wrap gap-1 px-2 py-1.5"
			style="background: var(--bg-elevated); border-bottom: 1px solid var(--border-color);"
		>
			<button
				type="button"
				class={btn(isActive('bold'))}
				onclick={() => editor?.chain().focus().toggleBold().run()}
			>
				<strong>B</strong>
			</button>
			<button
				type="button"
				class={btn(isActive('italic'))}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
			>
				<em>I</em>
			</button>
			<button
				type="button"
				class={btn(isActive('strike'))}
				onclick={() => editor?.chain().focus().toggleStrike().run()}
			>
				<s>S</s>
			</button>
			<div class="mx-1 w-px" style="background: var(--border-color);"></div>
			<button
				type="button"
				class={btn(isActive('heading', { level: 2 }))}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				H2
			</button>
			<button
				type="button"
				class={btn(isActive('heading', { level: 3 }))}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
			>
				H3
			</button>
			<div class="mx-1 w-px" style="background: var(--border-color);"></div>
			<button
				type="button"
				class={btn(isActive('bulletList'))}
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
			>
				&bull; List
			</button>
			<button
				type="button"
				class={btn(isActive('orderedList'))}
				onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			>
				1. List
			</button>
			<div class="mx-1 w-px" style="background: var(--border-color);"></div>
			<button
				type="button"
				class={btn(isActive('blockquote'))}
				onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			>
				&ldquo; Quote
			</button>
			<button
				type="button"
				class={btn(isActive('codeBlock'))}
				onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
			>
				Code
			</button>
			<div class="mx-1 w-px" style="background: var(--border-color);"></div>
			<button
				type="button"
				class="tiptap-btn rounded px-2 py-1 text-xs transition"
				onclick={() => editor?.chain().focus().setHorizontalRule().run()}
			>
				—
			</button>
		</div>
	{/if}
	<div class="max-h-[50vh] overflow-y-auto" bind:this={editorElement}></div>
</div>

<style>
	.tiptap-btn {
		background: var(--bg-surface);
		color: var(--text-secondary);
	}
	.tiptap-btn:hover {
		background: var(--bg-elevated);
	}
	.tiptap-btn-active {
		background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold));
		color: var(--bg-base);
	}
</style>
