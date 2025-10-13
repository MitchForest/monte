declare module 'mp3-duration' {
  function mp3Duration(input: string | Buffer): Promise<number>;
  export default mp3Duration;
}
