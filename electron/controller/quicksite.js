'use strict';

const { Controller } = require('ee-core');
const Services = require('ee-core/services');
const { pub } = require("../class/public.js");

/**
 * 快捷网站
 * @class
 */
class QuicksiteController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.TABLE = 'quick_site';
  }

  /**
   * @name 获取快捷网站列表
   * @param {object} args
   * @param {object} event
   * @returns {object}
   */
  async list(args, event) {
    let channel = args.channel;
    let search = args.data && args.data.search ? pub.trim(args.data.search) : '';

    let where = '';
    let params = [];
    if (search) {
      where = 'title LIKE ? OR url LIKE ? OR notes LIKE ?';
      let keyword = '%' + search + '%';
      params = [keyword, keyword, keyword];
    }

    let data = pub.M(this.TABLE).where(where, params).order('pin DESC,site_id DESC').select();
    return pub.send_success(event, channel, data);
  }

  /**
   * @name 添加快捷网站
   * @param {object} args
   * @param {object} event
   * @returns {object}
   */
  async add(args, event) {
    let channel = args.channel;
    let data = args.data || {};
    let title = pub.trim(data.title || '');
    let url = pub.trim(data.url || '');

    if (!title) return pub.send_error(event, channel, pub.lang('网站名称不能为空'));
    if (!url) return pub.send_error(event, channel, pub.lang('网站地址不能为空'));
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;

    let pdata = {
      title: title,
      url: url,
      username: data.username || '',
      password: data.password || '',
      notes: data.notes || '',
      pin: data.pin ? 1 : 0,
      addtime: pub.time()
    };

    let site_id = pub.M(this.TABLE).insert(pdata);
    if (site_id) {
      return pub.send_success(event, channel, pub.lang('添加成功'));
    }
    return pub.send_error(event, channel, pub.lang('添加失败'));
  }

  /**
   * @name 修改快捷网站
   * @param {object} args
   * @param {object} event
   * @returns {object}
   */
  async modify(args, event) {
    let channel = args.channel;
    let data = args.data || {};
    let site_id = data.site_id;
    let title = pub.trim(data.title || '');
    let url = pub.trim(data.url || '');

    if (!site_id) return pub.send_error(event, channel, pub.lang('参数错误'));
    if (!title) return pub.send_error(event, channel, pub.lang('网站名称不能为空'));
    if (!url) return pub.send_error(event, channel, pub.lang('网站地址不能为空'));
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;

    let pdata = {
      title: title,
      url: url,
      username: data.username || '',
      password: data.password || '',
      notes: data.notes || '',
      pin: data.pin ? 1 : 0
    };

    let update = pub.M(this.TABLE).where('site_id=?', site_id).update(pdata);
    if (update) {
      return pub.send_success(event, channel, pub.lang('修改成功'));
    }
    return pub.send_error(event, channel, pub.lang('修改失败'));
  }

  /**
   * @name 删除快捷网站
   * @param {object} args
   * @param {object} event
   * @returns {object}
   */
  async remove(args, event) {
    let channel = args.channel;
    let site_id = args.data ? args.data.site_id : 0;
    if (!site_id) return pub.send_error(event, channel, pub.lang('参数错误'));

    let del = pub.M(this.TABLE).where('site_id=?', site_id).delete();
    if (del) {
      return pub.send_success(event, channel, pub.lang('删除成功'));
    }
    return pub.send_error(event, channel, pub.lang('删除失败'));
  }

  /**
   * @name 设置/取消置顶
   * @param {object} args
   * @param {object} event
   * @returns {object}
   */
  async set_pin(args, event) {
    let channel = args.channel;
    let data = args.data || {};
    let site_id = data.site_id;
    if (!site_id) return pub.send_error(event, channel, pub.lang('参数错误'));

    pub.M(this.TABLE).where('site_id=?', site_id).update({ pin: data.pin ? 1 : 0 });
    return pub.send_success(event, channel, pub.lang('设置成功'));
  }

  /**
   * @name 使用内置浏览器窗口打开网站
   * @param {object} args
   * @param {object} event
   * @returns {object}
   */
  async open(args, event) {
    let channel = args.channel;
    let url = args.data ? pub.trim(args.data.url || '') : '';
    if (!url) return pub.send_error(event, channel, pub.lang('网站地址不能为空'));
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;

    Services.get('window').openInternalLink(url, 0);
    return pub.send_success(event, channel, pub.lang('已在内置浏览器中打开'));
  }
}

QuicksiteController.toString = () => '[class QuicksiteController]';
module.exports = QuicksiteController;
