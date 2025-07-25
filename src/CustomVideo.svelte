<!-- this builds the video player -->
<script>
	import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
	export let time = 0;
	export let src;
	$: if (!src) {
	  console.warn('CustomVideo: no video src provided');
	}
	let duration;
	let paused = true;
	let showControls = true;
	let showControlsTimeout;
	
	function handleEnd() {
		dispatch('finished');
	};

	function handleMousemove(e) {
		// Make the controls visible, but fade out after
		// 2.5 seconds of inactivity
		clearTimeout(showControlsTimeout);
		showControlsTimeout = setTimeout(() => showControls = false, 2500);
		showControls = true;

		if (!(e.buttons & 1)) return; // mouse not down
		if (!duration) return; // video not loaded yet

		// uncomment the following lines to enable seeking
		// const { left, right } = this.getBoundingClientRect();
		// time = duration * (e.clientX - left) / (right - left);
	}
	
	function handleMousedown(e) {
		// we can't rely on the built-in click event, because it fires
		// after a drag — we have to listen for clicks ourselves
		function handleMouseup() {
			if (paused) {
				dispatch('play');
				e.target.play();

			} else {
				dispatch('pause');
				e.target.pause();
			}
			cancel();
		}

		function cancel() {
			e.target.removeEventListener('mouseup', handleMouseup);
		}

		e.target.addEventListener('mouseup', handleMouseup);

		setTimeout(cancel, 200);
	};

	function format(seconds) {
		if (isNaN(seconds)) return '...';

		const minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds % 60);
		if (seconds < 10) seconds = '0' + seconds;

		return `${minutes}:${seconds}`;
	};
</script>

<style>
	div {
		position: relative;
	}

	.controls {
		position: absolute;
		top: 0;
		width: 100%;
		transition: opacity 1s;
	}

	.info {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}

	span {
		padding: 0.2em 0.5em;
		color: white;
		text-shadow: 0 0 8px black;
		font-size: 1.4em;
		opacity: 0.7;
	}

	.time {
		width: 3em;
	}

	.time:last-child { text-align: right }

	progress {
		display: block;
		width: 100%;
		height: 10px;
		-webkit-appearance: none;
		appearance: none;
	}

	progress::-webkit-progress-bar {
		background-color: rgba(0,0,0,0.2);
	}

	progress::-webkit-progress-value {
		background-color: rgba(255,255,255,0.6);
	}

	.video_cont {
		width: 50%;
        align-items: center;  
	}

	video {
        width: 100%;
        border: 1px solid #aaa;
		border-radius: 2px;
        box-shadow: 2px 2px 8px rgba(0,0,0,0.1);   
	}

	.video-error {
		color: red;
		font-weight: bold;
		padding: 1em;
		text-align: center;
	}
</style>

<div class="video_cont">
  <video
    id="my-video"
    src={src}
    preload="auto"
    on:mousemove={handleMousemove}
    on:mousedown={handleMousedown}
    bind:currentTime={time}
    bind:duration
    bind:paused
    on:ended={handleEnd}
    on:error={() => console.error(`CustomVideo: video load error for ${src}`)}
  ></video>
  <div class="controls" style="opacity: {duration && showControls ? 1 : 0}">
    <progress value="{(time / duration) || 0}"/>
    <div class="info">
      <span class="time">{format(time)}</span>
      <span id="instruction_text">click video to {paused ? 'play' : 'pause'}</span>
      <span class="time">{format(duration)}</span>
    </div>
  </div>
</div>