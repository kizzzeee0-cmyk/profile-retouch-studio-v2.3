export const DEFAULT_ADJUSTMENTS = {
  exposure: 0, brightness: 0, contrast: 0, saturation: 0, vibrance: 0,
  highlights: 0, shadows: 0, temperature: 0, tint: 0, yellowReduce: 0,
  clarity: 0, sharpen: 0, bloom: 0
}

const p = (id, name, category, values, hint='') => ({ id, name, category, values: { ...DEFAULT_ADJUSTMENTS, ...values }, hint })

export const PHOTO_PRESETS = [
  p('original-plus','Original Plus','Clean',{brightness:3,contrast:2,vibrance:4,highlights:-4,shadows:3,sharpen:4},'원본 분위기를 거의 그대로 유지'),
  p('clean-clear','Clean Clear','Clean',{brightness:5,contrast:5,vibrance:6,highlights:-8,shadows:6,clarity:3,sharpen:5},'맑고 또렷한 기본 보정'),
  p('neutral-clear','Neutral Clear','Clean',{brightness:4,contrast:3,vibrance:3,temperature:-1,highlights:-6,shadows:5,sharpen:4}),
  p('soft-clear','Soft Clear','Clean',{brightness:5,contrast:-2,vibrance:4,highlights:-10,shadows:7,bloom:3}),
  p('bright-clean','Bright Clean','Clean',{exposure:4,brightness:8,contrast:1,highlights:-12,shadows:9,vibrance:4}),
  p('white-clean','White Clean','Clean',{brightness:7,temperature:-4,yellowReduce:10,highlights:-8,shadows:4,saturation:-2}),

  p('cool-clear','Cool Clear','Cool',{temperature:-10,tint:2,brightness:4,contrast:4,vibrance:6,highlights:-8,shadows:5}),
  p('ice-blue','Ice Blue','Cool',{temperature:-17,tint:1,brightness:3,saturation:-2,vibrance:5,highlights:-10,shadows:7}),
  p('soft-blue','Soft Blue','Cool',{temperature:-9,tint:3,brightness:6,contrast:-3,vibrance:4,bloom:3}),
  p('lavender-cool','Lavender Cool','Cool',{temperature:-8,tint:8,brightness:4,vibrance:5,highlights:-7,shadows:5,bloom:2}),
  p('blue-hour','Blue Hour','Cool',{temperature:-15,tint:5,exposure:-2,contrast:7,highlights:-14,shadows:10,vibrance:8}),
  p('winter-clear','Winter Clear','Cool',{temperature:-13,tint:-1,brightness:4,contrast:6,saturation:-3,clarity:4,sharpen:5}),

  p('warm-clear','Warm Clear','Warm',{temperature:9,tint:1,brightness:4,contrast:3,vibrance:5,highlights:-8,shadows:5}),
  p('peach','Peach','Warm',{temperature:7,tint:7,brightness:5,contrast:-2,vibrance:5,yellowReduce:3,bloom:2}),
  p('cream','Cream','Warm',{temperature:6,tint:2,brightness:7,contrast:-5,saturation:-4,highlights:-8,shadows:8}),
  p('golden-hour','Golden Hour','Warm',{temperature:14,tint:3,contrast:6,vibrance:10,highlights:-12,shadows:6}),
  p('spring-warm','Spring Warm','Warm',{temperature:5,tint:4,brightness:6,vibrance:8,highlights:-10,shadows:7}),
  p('sunset-soft','Sunset Soft','Warm',{temperature:12,tint:8,brightness:2,contrast:2,vibrance:8,highlights:-15,shadows:8,bloom:3}),

  p('night-clear','Night Clear','Night',{exposure:2,brightness:3,contrast:8,temperature:-6,highlights:-18,shadows:16,vibrance:7,clarity:3}),
  p('night-blue','Night Blue','Night',{temperature:-16,tint:2,contrast:10,highlights:-20,shadows:14,vibrance:8}),
  p('night-purple','Night Purple','Night',{temperature:-11,tint:13,contrast:8,highlights:-18,shadows:12,vibrance:9}),
  p('neon-night','Neon Night','Night',{temperature:-8,tint:7,contrast:13,vibrance:14,highlights:-22,shadows:10,clarity:4}),
  p('moonlight','Moonlight','Night',{temperature:-18,tint:4,brightness:1,contrast:5,saturation:-5,highlights:-15,shadows:14,bloom:3}),
  p('midnight','Midnight','Night',{exposure:-4,temperature:-12,tint:8,contrast:14,saturation:-2,highlights:-18,shadows:8}),

  p('vtuber-clear','VTuber Clear','Character',{brightness:5,contrast:4,vibrance:5,temperature:-3,tint:2,yellowReduce:7,highlights:-9,shadows:5,sharpen:5}),
  p('vtuber-soft','VTuber Soft','Character',{brightness:6,contrast:-2,vibrance:4,temperature:-2,tint:3,yellowReduce:6,bloom:3}),
  p('anime-clean','Anime Clean','Character',{brightness:4,contrast:5,saturation:-1,vibrance:6,yellowReduce:5,clarity:2,sharpen:4}),
  p('skin-clear','Skin Clear','Character',{brightness:5,temperature:-4,tint:3,yellowReduce:14,highlights:-7,shadows:5,saturation:-3}),
  p('profile-pop','Profile Pop','Character',{brightness:5,contrast:7,vibrance:8,temperature:-2,yellowReduce:5,highlights:-10,shadows:6,sharpen:6}),
  p('soft-dream','Soft Dream','Character',{brightness:5,contrast:-5,vibrance:5,tint:4,highlights:-8,shadows:8,bloom:6}),

  p('flower','Flower','Environment',{brightness:5,vibrance:10,tint:4,highlights:-11,shadows:6,saturation:2}),
  p('garden','Garden','Environment',{brightness:3,vibrance:9,temperature:-2,contrast:4,highlights:-12,shadows:9}),
  p('sky','Sky','Environment',{brightness:4,temperature:-7,vibrance:9,highlights:-15,shadows:5,clarity:2}),
  p('ocean','Ocean','Environment',{temperature:-9,tint:-1,brightness:3,vibrance:10,contrast:4,highlights:-12}),
  p('cherry-blossom','Cherry Blossom','Environment',{temperature:2,tint:10,brightness:6,vibrance:7,contrast:-2,bloom:3}),
  p('forest','Forest','Environment',{exposure:1,contrast:5,vibrance:7,highlights:-14,shadows:13,temperature:-1}),
  p('city-night','City Night','Environment',{temperature:-7,tint:6,contrast:12,vibrance:12,highlights:-22,shadows:12}),

  p('lavender-dawn','Lavender Dawn','Mood',{temperature:-8,tint:10,brightness:4,contrast:-1,vibrance:6,highlights:-10,shadows:8,bloom:3}),
  p('pastel-day','Pastel Day','Mood',{brightness:7,contrast:-7,saturation:-6,vibrance:5,tint:3,highlights:-8,shadows:9}),
  p('dreamy-pink','Dreamy Pink','Mood',{brightness:5,tint:12,temperature:2,contrast:-6,vibrance:5,bloom:6}),
  p('crystal','Crystal','Mood',{temperature:-6,brightness:5,contrast:7,saturation:-3,vibrance:7,clarity:5,sharpen:6})
]

export const PRESET_CATEGORIES = [...new Set(PHOTO_PRESETS.map(x => x.category))]
