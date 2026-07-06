<template>
	<div class="quicksite px-[3.6rem] pt-[2.4rem]">
		<div class="quicksite__header flex justify-between mb-[2.4rem]">
			<div class="btn flex items-center">
				<el-button type="primary" size="large" @click="openAdd">{{
					pub.lang('添加网站')
				}}</el-button>
				<el-button size="large" :icon="Refresh" @click="getSiteList()"></el-button>
			</div>
			<div class="flex items-center">
				<el-input
					v-model="search"
					size="large"
					class="w-[26rem]"
					clearable
					:prefix-icon="Search"
					:placeholder="pub.lang('搜索网站名称/地址/备注')"
					@keydown.enter="getSiteList()"
					@clear="getSiteList()" />
			</div>
		</div>
		<div class="quicksite__content">
			<el-table :data="siteList" size="large" :height="mainHeight - 110" v-loading="loading">
				<el-table-column :label="pub.lang('网站名称')" min-width="160">
					<template #default="{ row }">
						<div class="flex items-center">
							<el-icon
								v-if="row.pin"
								color="#F7B851"
								:size="16"
								class="mr-[.4rem] flex-shrink-0"
								:title="pub.lang('已置顶')">
								<StarFilled />
							</el-icon>
							<span class="truncate">{{ row.title }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="pub.lang('网站地址')" min-width="220">
					<template #default="{ row }">
						<el-link type="primary" :underline="false" @click="openSite(row)">
							<span class="truncate max-w-[30rem]">{{ row.url }}</span>
						</el-link>
					</template>
				</el-table-column>
				<el-table-column :label="pub.lang('账号')" min-width="140">
					<template #default="{ row }">
						<div v-if="row.username" class="flex items-center">
							<span class="truncate max-w-[16rem]">{{ row.username }}</span>
							<el-icon
								class="ml-[.4rem] cursor-pointer copy-icon"
								:title="pub.lang('复制账号')"
								@click="copyText({ value: row.username })">
								<CopyDocument />
							</el-icon>
						</div>
						<span v-else class="text-gray-400">--</span>
					</template>
				</el-table-column>
				<el-table-column :label="pub.lang('密码')" min-width="140">
					<template #default="{ row }">
						<div v-if="row.password" class="flex items-center">
							<span class="truncate max-w-[16rem]">{{
								showPassword[row.site_id] ? row.password : '••••••••'
							}}</span>
							<el-icon
								class="ml-[.4rem] cursor-pointer copy-icon"
								:title="showPassword[row.site_id] ? pub.lang('隐藏密码') : pub.lang('显示密码')"
								@click="showPassword[row.site_id] = !showPassword[row.site_id]">
								<Hide v-if="showPassword[row.site_id]" />
								<View v-else />
							</el-icon>
							<el-icon
								class="ml-[.4rem] cursor-pointer copy-icon"
								:title="pub.lang('复制密码')"
								@click="copyText({ value: row.password })">
								<CopyDocument />
							</el-icon>
						</div>
						<span v-else class="text-gray-400">--</span>
					</template>
				</el-table-column>
				<el-table-column :label="pub.lang('备注')" min-width="160">
					<template #default="{ row }">
						<el-tooltip
							v-if="row.notes"
							effect="dark"
							:content="row.notes"
							placement="top"
							:enterable="false">
							<span class="truncate max-w-[20rem] inline-block align-middle">{{ row.notes }}</span>
						</el-tooltip>
						<span v-else class="text-gray-400">--</span>
					</template>
				</el-table-column>
				<el-table-column :label="pub.lang('操作')" width="200" fixed="right">
					<template #default="{ row }">
						<el-button link type="primary" @click="openSite(row)">{{
							pub.lang('打开')
						}}</el-button>
						<el-button link type="primary" @click="togglePin(row)">{{
							row.pin ? pub.lang('取消置顶') : pub.lang('置顶')
						}}</el-button>
						<el-button link type="primary" @click="openEdit(row)">{{
							pub.lang('编辑')
						}}</el-button>
						<el-button link type="danger" @click="removeSite(row)">{{
							pub.lang('删除')
						}}</el-button>
					</template>
				</el-table-column>
				<template #empty>
					<el-empty :description="pub.lang('暂无快捷网站，点击左上角【添加网站】进行添加')" />
				</template>
			</el-table>
		</div>

		<el-dialog
			v-model="dialogVisible"
			align-center
			width="460"
			draggable
			:close-on-click-modal="false"
			:title="isEdit ? pub.lang('编辑{}', form.title) : pub.lang('添加网站')">
			<el-form :model="form" ref="formRef" :rules="rules" label-width="80px" @submit.prevent>
				<el-form-item :label="pub.lang('网站名称')" prop="title">
					<el-input v-model="form.title" :placeholder="pub.lang('请输入网站名称')" />
				</el-form-item>
				<el-form-item :label="pub.lang('网站地址')" prop="url">
					<el-input v-model="form.url" :placeholder="pub.lang('如: https://demo.com')" />
				</el-form-item>
				<el-form-item :label="pub.lang('账号')">
					<el-input v-model="form.username" :placeholder="pub.lang('选填')" />
				</el-form-item>
				<el-form-item :label="pub.lang('密码')">
					<el-input
						v-model="form.password"
						type="password"
						show-password
						:placeholder="pub.lang('选填')" />
				</el-form-item>
				<el-form-item :label="pub.lang('备注')">
					<el-input
						v-model="form.notes"
						type="textarea"
						:rows="3"
						:placeholder="pub.lang('选填，如：测试环境管理后台')" />
				</el-form-item>
				<el-form-item :label="pub.lang('置顶')">
					<el-switch v-model="form.pin" :active-value="1" :inactive-value="0" />
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">{{ pub.lang('取消') }}</el-button>
					<el-button type="primary" @click="save">{{ pub.lang('保存') }}</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ElMessageBox } from 'element-plus'
import {
	Refresh,
	Search,
	View,
	Hide,
	CopyDocument,
	StarFilled,
} from '@element-plus/icons-vue'
import { pub, copyText } from '@utils/tools'
import { useMessage } from '@utils/hooks/message'
import { common, routes } from '@api/http'
import { useSettingStore } from '@store/setting'

interface QuickSite {
	site_id: number
	title: string
	url: string
	username: string
	password: string
	notes: string
	pin: number
	addtime: number
}

const Message = useMessage()
const { mainHeight } = storeToRefs(useSettingStore())

const siteList = ref<QuickSite[]>([])
const loading = ref(false)
const search = ref('')
const showPassword = reactive<Record<number, boolean>>({})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
	site_id: 0,
	title: '',
	url: '',
	username: '',
	password: '',
	notes: '',
	pin: 0,
})
const rules = {
	title: [{ required: true, message: pub.lang('请输入网站名称'), trigger: 'blur' }],
	url: [{ required: true, message: pub.lang('请输入网站地址'), trigger: 'blur' }],
}

// 获取快捷网站列表
const getSiteList = async () => {
	loading.value = true
	const res: any = await common.sendAsync({
		route: routes.quicksite.list.path,
		data: { search: search.value },
	})
	loading.value = false
	if (res.status) {
		siteList.value = res.data || []
	} else {
		Message.error(res.msg)
	}
}

// 打开添加弹窗
const openAdd = () => {
	isEdit.value = false
	Object.assign(form, {
		site_id: 0,
		title: '',
		url: '',
		username: '',
		password: '',
		notes: '',
		pin: 0,
	})
	dialogVisible.value = true
}

// 打开编辑弹窗
const openEdit = (row: QuickSite) => {
	isEdit.value = true
	Object.assign(form, {
		site_id: row.site_id,
		title: row.title,
		url: row.url,
		username: row.username,
		password: row.password,
		notes: row.notes,
		pin: row.pin,
	})
	dialogVisible.value = true
}

// 保存
const save = () => {
	formRef.value.validate((valid: boolean) => {
		if (!valid) return
		const route = isEdit.value ? routes.quicksite.modify.path : routes.quicksite.add.path
		common.send(route, { ...form }, (res: any) => {
			if (res.status) {
				Message.success(res.msg)
				dialogVisible.value = false
				getSiteList()
			} else {
				Message.error(res.msg)
			}
		})
	})
}

// 删除
const removeSite = (row: QuickSite) => {
	ElMessageBox.confirm(
		pub.lang('确定要删除快捷网站【{}】吗？', row.title),
		pub.lang('删除快捷网站'),
		{
			confirmButtonText: pub.lang('确定'),
			cancelButtonText: pub.lang('取消'),
			type: 'warning',
		}
	).then(() => {
		common.send(routes.quicksite.remove.path, { site_id: row.site_id }, (res: any) => {
			if (res.status) {
				Message.success(res.msg)
				getSiteList()
			} else {
				Message.error(res.msg)
			}
		})
	})
}

// 置顶/取消置顶
const togglePin = (row: QuickSite) => {
	common.send(
		routes.quicksite.set_pin.path,
		{ site_id: row.site_id, pin: row.pin ? 0 : 1 },
		(res: any) => {
			if (res.status) {
				getSiteList()
			} else {
				Message.error(res.msg)
			}
		}
	)
}

// 使用系统默认浏览器打开
const openSite = (row: QuickSite) => {
	common.send(routes.quicksite.open.path, { url: row.url }, (res: any) => {
		if (!res.status) Message.error(res.msg)
	})
}

onMounted(() => {
	getSiteList()
})
</script>

<style scoped lang="scss">
.quicksite {
	.copy-icon {
		color: var(--el-color-primary);
		&:hover {
			opacity: 0.8;
		}
	}
}
</style>
