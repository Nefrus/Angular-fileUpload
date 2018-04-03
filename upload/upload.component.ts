import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  // 文件
  files: File[];
  // input 输入框
  @ViewChild('fileinput')
  fileinput: ElementRef;
  // 进度
  progress;
  // 是否自动提交
  @Input() auto = true;
  // 是否隐藏
  @Input() hide = 'false';
  // formData的名字
  @Input() name = 'uploadFile';
  // 目的地址
  @Input() url = '';
  // 提交方式
  @Input() method = 'Post';
  // 是否为多文件上传
  @Input() multiple = false;
  // 文件发送前 事件
  @Output() beforeSendEvent = new EventEmitter();
  // 上传前 事件
  @Output() beforeUploadEvent = new EventEmitter();
  // 内容清除 事件
  @Output() clearEvent = new EventEmitter();
  // 上传失败 事件
  @Output() errorEvent = new EventEmitter();
  // 上传进度 事件
  @Output() progressEvent = new EventEmitter();
  // 上传成功 事件
  @Output() uploadEvent = new EventEmitter();
  // 文件选中 事件
  @Output() selectEvent = new EventEmitter();


  constructor() {
  }

  ngOnInit() {
    this.files = [];
  }


  /**
   * 清空数据
   */
  clear() {
    this.files = [];
    this.clearEvent.emit();
    this.fileinput.nativeElement.value = '';
  }

  /**
   * 文件选择事件
   * @param event:$event
   */
  fileSelect(event) {
    const _files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
    for (let i = 0; i < _files.length; i++) {
      this.files.push(_files[i]);
    }
    this.selectEvent.emit({originalEvent: event, files: _files});
    if (this.hasFiles() && this.auto) {
      console.log('upload');
      this.upload();
    }
    this.fileinput.nativeElement.value = '';
  }

  /**
   * 文件是否存在
   * @returns {File[] | boolean}
   */
  hasFiles() {
    return this.files && this.files.length > 0;
  }

  /**
   * 文件上传
   */
  upload() {
    const _this = this;
    const _xhr = new XMLHttpRequest();
    const _formData = new FormData();
    this.beforeUploadEvent.emit({
      'xhr': _xhr,
      'formData': _formData
    });
    for (let i = 0; i < this.files.length; i++) {
      _formData.append(this.name, this.files[i], this.files[i].name);
    }
    _xhr.upload.addEventListener('progress', function (e) {
      if (e.lengthComputable) {
        _this.progress = Math.round((e.loaded * 100) / e.total);
      }
      _this.progressEvent.emit({originalEvent: e, progress: _this.progressEvent});
    }, false);
    _xhr.onreadystatechange = function () {
      if (_xhr.readyState === 4) {
        _this.progress = 0;
        if (_xhr.status >= 200 && _xhr.status < 300) {
          _this.uploadEvent.emit({xhr: _xhr, files: _this.files});
        } else {
          _this.errorEvent.emit({xhr: _xhr, files: _this.files});
        }
        _this.clear();
      }
    };
    _xhr.open(this.method, this.url, true);
    this.beforeSendEvent.emit({
      'xhr': _xhr,
      'formData': _formData
    });
    _xhr.send(_formData);
  }

  /**
   * 点击事件
   */
  click() {
    this.fileinput.nativeElement.click();
  }
}
