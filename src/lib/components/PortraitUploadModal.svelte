<script lang="ts">
	let {
		open = false,
		hasExistingPortrait = false,
		onsave,
		onremove,
		oncancel
	}: {
		open?: boolean;
		hasExistingPortrait?: boolean;
		onsave?: (dataUrl: string) => void;
		onremove?: () => void;
		oncancel?: () => void;
	} = $props();

	let portraitImg: HTMLImageElement | null = $state(null);
	let cropCanvas: HTMLCanvasElement | null = $state(null);
	let cropOffsetX = $state(0);
	let cropOffsetY = $state(0);
	let cropScale = $state(1);
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let dragStartOffsetX = $state(0);
	let dragStartOffsetY = $state(0);

	const PORTRAIT_SIZE = 256;

	$effect(() => {
		if (open) {
			portraitImg = null;
			cropOffsetX = 0;
			cropOffsetY = 0;
			cropScale = 1;
		}
	});

	$effect(() => {
		if (cropCanvas && portraitImg) {
			void cropOffsetX;
			void cropOffsetY;
			void cropScale;
			drawCropPreview();
		}
	});

	function handlePortraitFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				portraitImg = img;
				const minDim = Math.min(img.width, img.height);
				cropScale = PORTRAIT_SIZE / minDim;
				cropOffsetX = (PORTRAIT_SIZE - img.width * cropScale) / 2;
				cropOffsetY = (PORTRAIT_SIZE - img.height * cropScale) / 2;
				drawCropPreview();
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function drawCropPreview() {
		if (!cropCanvas || !portraitImg) return;
		const ctx = cropCanvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
		ctx.fillStyle = '#1a1a1a';
		ctx.fillRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
		ctx.drawImage(
			portraitImg,
			cropOffsetX,
			cropOffsetY,
			portraitImg.width * cropScale,
			portraitImg.height * cropScale
		);
	}

	function onCropWheel(e: WheelEvent) {
		e.preventDefault();
		if (!portraitImg) return;
		const delta = e.deltaY > 0 ? 0.95 : 1.05;
		const newScale = Math.max(0.1, Math.min(10, cropScale * delta));
		const cx = PORTRAIT_SIZE / 2;
		const cy = PORTRAIT_SIZE / 2;
		cropOffsetX = cx - ((cx - cropOffsetX) / cropScale) * newScale;
		cropOffsetY = cy - ((cy - cropOffsetY) / cropScale) * newScale;
		cropScale = newScale;
		drawCropPreview();
	}

	function onCropPointerDown(e: PointerEvent) {
		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragStartOffsetX = cropOffsetX;
		dragStartOffsetY = cropOffsetY;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onCropPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		cropOffsetX = dragStartOffsetX + (e.clientX - dragStartX);
		cropOffsetY = dragStartOffsetY + (e.clientY - dragStartY);
		drawCropPreview();
	}

	function onCropPointerUp() {
		isDragging = false;
	}

	function handleSave() {
		if (!cropCanvas || !onsave) return;
		const dataUrl = cropCanvas.toDataURL('image/webp', 0.85);
		onsave(dataUrl);
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget && oncancel) oncancel();
		}}
		role="dialog"
		aria-modal="true"
		aria-label="Upload Portrait"
	>
		<div
			class="mx-4 w-full max-w-md rounded-lg p-6 shadow-2xl"
			style="background: var(--bg-base); border: 1px solid var(--color-gold-dark);"
		>
			<h2
				class="mb-4 text-2xl font-bold"
				style="color: var(--color-gold); font-family: var(--font-heading);"
			>
				Portrait
			</h2>

			{#if !portraitImg}
				<label
					class="flex h-48 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition"
					style="border-color: var(--border-color);"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mb-2 h-10 w-10"
						style="color: var(--text-muted);"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="text-sm" style="color: var(--text-secondary);">Click to select an image</span
					>
					<input type="file" accept="image/*" class="hidden" onchange={handlePortraitFile} />
				</label>
			{:else}
				<div class="flex flex-col items-center gap-3">
					<p class="text-xs" style="color: var(--text-muted);">
						Drag to reposition. Scroll to zoom.
					</p>
					<div
						class="overflow-hidden rounded-lg"
						style="width: {PORTRAIT_SIZE}px; height: {PORTRAIT_SIZE}px; border: 1px solid var(--border-color);"
					>
						<canvas
							bind:this={cropCanvas}
							width={PORTRAIT_SIZE}
							height={PORTRAIT_SIZE}
							class="cursor-grab active:cursor-grabbing"
							onwheel={onCropWheel}
							onpointerdown={onCropPointerDown}
							onpointermove={onCropPointerMove}
							onpointerup={onCropPointerUp}
							onpointercancel={onCropPointerUp}
						></canvas>
					</div>
					<label class="cursor-pointer text-xs underline" style="color: var(--color-gold);">
						Choose different image
						<input type="file" accept="image/*" class="hidden" onchange={handlePortraitFile} />
					</label>
				</div>
			{/if}

			<div class="mt-4 flex justify-end gap-3">
				{#if hasExistingPortrait && onremove}
					<button
						onclick={onremove}
						class="mr-auto rounded bg-red-900/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-900/50"
					>
						Remove
					</button>
				{/if}
				{#if oncancel}
					<button
						onclick={oncancel}
						class="rounded px-4 py-2 text-sm transition"
						style="background: var(--bg-elevated); color: var(--text-secondary);"
					>
						Cancel
					</button>
				{/if}
				<button
					onclick={handleSave}
					disabled={!portraitImg}
					class="rounded px-4 py-2 text-sm font-semibold transition"
					style={portraitImg
						? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
						: 'background: var(--bg-elevated); color: var(--text-muted); cursor: not-allowed;'}
				>
					Save Portrait
				</button>
			</div>
		</div>
	</div>
{/if}
