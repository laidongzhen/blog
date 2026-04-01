# 图片

展示图片，可以用在任意地方

```vue
<ImageAuth v-if="item.imageId" :preview="false" class="auth-img-box" :src="imgUrl + item.imageId" />

import ImageAuth from '@/components/ImageAuth/index.vue'
import { useGlobSetting } from '/@/hooks/setting'
const glob = useGlobSetting()
const imgUrl = glob.fileUrl
:preview="false"  禁用预览功能
```

> imageId	： 为图片的id，基本都是字段imageId
>
> imgUrl的值即为  VITE_GLOB_UPLOAD_URL=http://172.30.1.222:7009/res/fjxhx/file/download/file/