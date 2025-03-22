export const vertex = /* glsl */`
#define PHONG

varying vec3 vViewPosition;

#include <common>                    // 包含常用的数学函数和常量定义
#include <batching_pars_vertex>      // 实现GPU实例化批处理相关的参数
#include <uv_pars_vertex>            // 定义UV坐标相关的变量
#include <displacementmap_pars_vertex> // 位移贴图相关的参数定义
#include <envmap_pars_vertex>        // 环境贴图在顶点着色器中的参数
#include <color_pars_vertex>         // 顶点颜色相关参数
#include <fog_pars_vertex>           // 雾效果相关参数
#include <normal_pars_vertex>        // 法线计算相关参数
#include <morphtarget_pars_vertex>   // 变形目标(morph targets)动画相关参数
#include <skinning_pars_vertex>      // 骨骼蒙皮动画相关参数
#include <shadowmap_pars_vertex>     // 阴影贴图相关参数
#include <logdepthbuf_pars_vertex>   // 对数深度缓冲相关参数
#include <clipping_planes_pars_vertex> // 裁剪平面相关参数

void main() {

	#include <uv_vertex>             // 处理UV坐标
	#include <color_vertex>          // 处理顶点颜色
	#include <morphcolor_vertex>     // 处理变形目标颜色
	#include <batching_vertex>       // 处理GPU实例化批处理

	#include <beginnormal_vertex>    // 初始化法线计算
	#include <morphinstance_vertex>  // 处理实例化变形
	#include <morphnormal_vertex>    // 处理变形目标法线
	#include <skinbase_vertex>       // 初始化蒙皮
	#include <skinnormal_vertex>     // 处理蒙皮法线
	#include <defaultnormal_vertex>  // 设置默认法线
	#include <normal_vertex>         // 最终法线处理

	#include <begin_vertex>          // 初始化顶点位置
	#include <morphtarget_vertex>    // 应用变形目标
	#include <skinning_vertex>       // 应用蒙皮
	#include <displacementmap_vertex> // 应用位移贴图
	#include <project_vertex>        // 投影顶点到裁剪空间
	#include <logdepthbuf_vertex>    // 应用对数深度缓冲
	#include <clipping_planes_vertex> // 应用裁剪平面

	vViewPosition = - mvPosition.xyz; // 计算视图空间中的位置

	#include <worldpos_vertex>       // 计算世界空间中的位置
	#include <envmap_vertex>         // 处理环境贴图
	#include <shadowmap_vertex>      // 处理阴影贴图
	#include <fog_vertex>            // 处理雾效果

}
`;

export const fragment = /* glsl */`
#define PHONG

uniform vec3 diffuse;                // 漫反射颜色
uniform vec3 emissive;               // 自发光颜色
uniform vec3 specular;               // 高光颜色
uniform float shininess;             // 高光亮度
uniform float opacity;               // 不透明度

#include <common>                    // 包含常用的数学函数和常量
#include <packing>                   // 用于打包/解包数据的函数
#include <dithering_pars_fragment>   // 抖动效果相关参数
#include <color_pars_fragment>       // 颜色处理相关参数
#include <uv_pars_fragment>          // UV坐标相关参数
#include <map_pars_fragment>         // 漫反射贴图相关参数
#include <alphamap_pars_fragment>    // Alpha贴图相关参数
#include <alphatest_pars_fragment>   // Alpha测试相关参数
#include <alphahash_pars_fragment>   // Alpha哈希相关参数
#include <aomap_pars_fragment>       // 环境光遮蔽贴图相关参数
#include <lightmap_pars_fragment>    // 光照贴图相关参数
#include <emissivemap_pars_fragment> // 自发光贴图相关参数
#include <envmap_common_pars_fragment> // 环境贴图通用参数
#include <envmap_pars_fragment>      // 环境贴图相关参数
#include <fog_pars_fragment>         // 雾效果相关参数
#include <bsdfs>                     // 双向散射分布函数(BSDF)的实现
#include <lights_pars_begin>         // 光照计算的初始化
#include <normal_pars_fragment>      // 法线计算相关参数
#include <lights_phong_pars_fragment> // Phong光照模型特定参数
#include <shadowmap_pars_fragment>   // 阴影贴图相关参数
#include <bumpmap_pars_fragment>     // 凹凸贴图相关参数
#include <normalmap_pars_fragment>   // 法线贴图相关参数
#include <specularmap_pars_fragment> // 高光贴图相关参数
#include <logdepthbuf_pars_fragment> // 对数深度缓冲相关参数
#include <clipping_planes_pars_fragment> // 裁剪平面相关参数

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity ); // 初始化漫反射颜色
	#include <clipping_planes_fragment> // 应用裁剪平面

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) ); // 初始化反射光
	vec3 totalEmissiveRadiance = emissive; // 初始化自发光

	#include <logdepthbuf_fragment>   // 处理对数深度缓冲
	#include <map_fragment>           // 应用漫反射贴图
	#include <color_fragment>         // 处理颜色
	#include <alphamap_fragment>      // 应用Alpha贴图
	#include <alphatest_fragment>     // 应用Alpha测试
	#include <alphahash_fragment>     // 应用Alpha哈希
	#include <specularmap_fragment>   // 应用高光贴图
	#include <normal_fragment_begin>  // 开始法线处理
	#include <normal_fragment_maps>   // 应用法线贴图
	#include <emissivemap_fragment>   // 应用自发光贴图

	// 光照累积
	#include <lights_phong_fragment>  // Phong光照模型计算
	#include <lights_fragment_begin>  // 开始光照计算
	#include <lights_fragment_maps>   // 应用光照贴图
	#include <lights_fragment_end>    // 结束光照计算

	// 调制
	#include <aomap_fragment>         // 应用环境光遮蔽

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance; // 计算最终输出光

	#include <envmap_fragment>        // 应用环境贴图
	#include <opaque_fragment>        // 处理不透明部分
	#include <tonemapping_fragment>   // 应用色调映射
	#include <colorspace_fragment>    // 应用颜色空间转换
	#include <fog_fragment>           // 应用雾效果
	#include <premultiplied_alpha_fragment> // 应用预乘Alpha
	#include <dithering_fragment>     // 应用抖动效果

}
`;
