/**
 * 字典类型常量定义
 * 统一管理所有字典类型编码，避免在各页面中硬编码字符串
 *
 * 数据来源：docs/后端接口/system/dict_data_document.md
 */

// ===== 系统模块字典 =====

/** 用户类型 (sys_user.user_type) */
export const DICT_USER_TYPE = 'sys_user_type' as const

/** 用户性别 (sys_user.sex) */
export const DICT_USER_SEX = 'sys_user_sex' as const

/** 通用状态 (sys_user.status / sys_role.status / sys_menu.status / sys_dict_type.status / sys_dict_data.status) */
export const DICT_COMMON_STATUS = 'sys_common_status' as const

/** 数据范围 (sys_role.data_scope) */
export const DICT_DATA_SCOPE = 'sys_data_scope' as const

/** 是否开关 (sys_menu.is_frame / sys_menu.is_cache / sys_dict_data.is_default / sys_config.config_type / sys_task.open_flag) */
export const DICT_YES_NO = 'sys_yes_no' as const

/** 菜单类型 (sys_menu.menu_type) */
export const DICT_MENU_TYPE = 'sys_menu_type' as const

/** 菜单显示状态 (sys_menu.visible) */
export const DICT_MENU_VISIBLE = 'sys_menu_visible' as const

/** 公告类型 (sys_notice.notice_type) */
export const DICT_NOTICE_TYPE = 'sys_notice_type' as const

/** 公告状态 (sys_notice.status) */
export const DICT_NOTICE_STATUS = 'sys_notice_status' as const

/** 任务类型 (sys_task.type) */
export const DICT_TASK_TYPE = 'sys_task_type' as const

/** 任务依赖类型 (sys_task_link.type) */
export const DICT_TASK_LINK_TYPE = 'sys_task_link_type' as const

// ===== 文档模块字典 =====

/** 笔记等级 (document_note.note_grade) */
export const DICT_NOTE_GRADE = 'doc_note_grade' as const

/** 笔记模式 (document_note.note_mode) */
export const DICT_NOTE_MODE = 'doc_note_mode' as const

/** 审核状态 (通用审核状态，用于文档、视频及其评论) */
export const DICT_AUDIT_STATUS = 'doc_audit_status' as const

/** 笔记状态 (document_note.status) */
export const DICT_NOTE_STATUS = 'doc_note_status' as const

/** 评论状态 (document_note_comment.status / document_video_comment.status) */
export const DICT_COMMENT_STATUS = 'doc_comment_status' as const

/** 文件类型 (document_files.file_type) */
export const DICT_FILE_TYPE = 'doc_file_type' as const

/** 上传状态 (document_files.status) */
export const DICT_UPLOAD_STATUS = 'doc_upload_status' as const

/** 处理状态 (document_process.status / document_process_history.status) */
export const DICT_PROCESS_STATUS = 'doc_process_status' as const

/** 视频状态 (document_video.status) */
export const DICT_VIDEO_STATUS = 'doc_video_status' as const

/** 合集状态 (document_video_collection.status) */
export const DICT_COLLECTION_STATUS = 'doc_collection_status' as const

/** 交互类型 (document_user_interaction.interaction_type) */
export const DICT_INTERACTION_TYPE = 'doc_interaction_type' as const

/** 交互目标类型 (document_user_interaction.target_type) */
export const DICT_INTERACTION_TARGET = 'doc_interaction_target' as const

/** 交互状态 (document_user_interaction.status) */
export const DICT_INTERACTION_STATUS = 'doc_interaction_status' as const

/** 审核目标类型 (document_audit.target_type) */
export const DICT_AUDIT_TARGET_TYPE = 'doc_audit_target_type' as const

/** 审核类型 (document_audit.audit_type) */
export const DICT_AUDIT_TYPE = 'doc_audit_type' as const

/** 风险等级 (document_audit.risk_level) */
export const DICT_RISK_LEVEL = 'doc_risk_level' as const

// ===== 内容分类字典 =====

/** 视频分类 */
export const DICT_VIDEO_CATEGORY = 'video_category' as const

/** 视频标签 */
export const DICT_VIDEO_TAG = 'video_tag' as const

/** 视频违规原因 */
export const DICT_VIDEO_VIOLATION_REASON = 'video_violation_reason' as const

/** 文档分类 */
export const DICT_DOCUMENT_CATEGORY = 'document_category' as const

/** 文档标签 */
export const DICT_DOCUMENT_TAG = 'document_tag' as const

/** 文档违规原因 */
export const DICT_DOCUMENT_VIOLATION_REASON = 'document_violation_reason' as const

// ===== 字典类型映射表（供类型推导使用） =====

export const DICT_TYPE_MAP = {
  // 系统模块
  user_type: DICT_USER_TYPE,
  user_sex: DICT_USER_SEX,
  common_status: DICT_COMMON_STATUS,
  data_scope: DICT_DATA_SCOPE,
  yes_no: DICT_YES_NO,
  menu_type: DICT_MENU_TYPE,
  menu_visible: DICT_MENU_VISIBLE,
  notice_type: DICT_NOTICE_TYPE,
  notice_status: DICT_NOTICE_STATUS,
  task_type: DICT_TASK_TYPE,
  task_link_type: DICT_TASK_LINK_TYPE,
  // 文档模块
  note_grade: DICT_NOTE_GRADE,
  note_mode: DICT_NOTE_MODE,
  audit_status: DICT_AUDIT_STATUS,
  note_status: DICT_NOTE_STATUS,
  comment_status: DICT_COMMENT_STATUS,
  file_type: DICT_FILE_TYPE,
  upload_status: DICT_UPLOAD_STATUS,
  process_status: DICT_PROCESS_STATUS,
  video_status: DICT_VIDEO_STATUS,
  collection_status: DICT_COLLECTION_STATUS,
  interaction_type: DICT_INTERACTION_TYPE,
  interaction_target: DICT_INTERACTION_TARGET,
  interaction_status: DICT_INTERACTION_STATUS,
  audit_target_type: DICT_AUDIT_TARGET_TYPE,
  audit_type: DICT_AUDIT_TYPE,
  risk_level: DICT_RISK_LEVEL,
  // 内容分类
  video_category: DICT_VIDEO_CATEGORY,
  video_tag: DICT_VIDEO_TAG,
  video_violation_reason: DICT_VIDEO_VIOLATION_REASON,
  document_category: DICT_DOCUMENT_CATEGORY,
  document_tag: DICT_DOCUMENT_TAG,
  document_violation_reason: DICT_DOCUMENT_VIOLATION_REASON,
} as const

export type DictTypeKey = keyof typeof DICT_TYPE_MAP
export type DictTypeValue = (typeof DICT_TYPE_MAP)[DictTypeKey]
