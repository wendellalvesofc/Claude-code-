# Vídeo 14: remove o iPhone roxo da mesa (quadros 543–602). Resto intacto; cores BT.709 e áudio originais.
import subprocess, sys, numpy as np
sys.path.insert(0, "scripts"); from remove import frame
W, H = 1080, 1920; A, B = 543, 602
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", "source/video14.mov", "-fps_mode", "passthrough", "-vf",
    "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
    "-i", "source/video14.mov", "-map", "0:v", "-map", "1:a",
    "-vf", "scale=out_color_matrix=bt709:out_range=tv:in_range=pc:flags=accurate_rnd+full_chroma_int,format=yuv420p",
    "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-c:a", "copy", "-movflags", "+faststart", "out/realme_video_14.mp4"], stdin=subprocess.PIPE)
n = 0
while True:
    b = dec.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    enc.stdin.write(frame(n - 530).tobytes() if A <= n <= B else b); n += 1
enc.stdin.close(); enc.wait(); dec.wait(); print("quadros", n)
