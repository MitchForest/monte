const assetExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('[narration] unable to verify asset', { url, error });
    return false;
  }
};

export const resolveNarrationAssets = async (
  lessonId: string,
  segmentId: string,
): Promise<{ audio?: string; caption?: string }> => {
  const basePath = `/curriculum/assets/audio/${lessonId}/${segmentId}`;
  const audioUrl = `${basePath}.mp3`;
  const captionUrl = `${basePath}.vtt`;

  const [audioAvailable, captionAvailable] = await Promise.all([
    assetExists(audioUrl),
    assetExists(captionUrl),
  ]);

  return {
    audio: audioAvailable ? audioUrl : undefined,
    caption: captionAvailable ? captionUrl : undefined,
  };
};
