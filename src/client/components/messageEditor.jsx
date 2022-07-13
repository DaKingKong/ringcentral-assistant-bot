import React, { useRef, useEffect, useState } from 'react';
import { styled, palette2 } from '@ringcentral/juno/foundation';
import {
  RcIconButton,
  RcTextarea,
  RcPopper,
  RcTooltip,
} from '@ringcentral/juno';
import {
  Emoji as emojiSvg,
  SaveDraft as saveDraftSvg,
  NoteBorder as noteSvg,
  RichTextEditor as signatureSvg,
} from '@ringcentral/juno-icon';
import emojiData from '@emoji-mart/data'
import { Picker } from 'emoji-mart'

const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const MessageToolLine = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const MessageToolLineRight = styled(MessageToolLine)`
  flex: 1;
  justify-content: flex-end;
  width: auto;
`;

const MessageTextarea = styled(RcTextarea)`
  width: 100%;
  margin-bottom: 20px;
  textarea {
    padding: 0 10px;
  }

  .RcTextareaInput-inputMultiline {
    background: ${palette2('neutral', 'b01')};
  }
`;

function EmojiPicker(props) {
  const ref = useRef()

  useEffect(() => {
    const picker = new Picker({ ...props, data: emojiData, ref })
    return () => {
      picker.remove();
    };
  }, [])

  return <div style={{ height: '435px' }} ref={ref} />
}

function EmojiPopper({
  open,
  anchorEl,
  onEmojiSelect,
  placement
}) {
  return (
    <RcPopper
      open={open}
      anchorEl={anchorEl}
      placement={placement}
    >
      <EmojiPicker onEmojiSelect={onEmojiSelect} />
    </RcPopper>
  );
}

export function MessageEditor({
  value,
  onChange,
  inputRef,
  onEmojiAdded,
  onOpenSaveTemplateDialog,
  onOpenLoadTemplateDialog,
  loadTemplateEnabled,
  onOpenSignatureDialog,
  showToolbar = true,
  minRows = 4,
  emojiWindowPlacement = 'bottom-start',
  onKeyUp,
  disabled,
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiButtonRef = useRef(null);

  return (
    <Root>
      <MessageToolLine>
        <RcIconButton
          symbol={emojiSvg}
          title="Emoji"
          innerRef={emojiButtonRef}
          onClick={() => setEmojiOpen(!emojiOpen)}
        />
        {
          showToolbar && (
            <MessageToolLineRight>
              <RcTooltip title="Save message as a template.">
                <span>
                  <RcIconButton
                    symbol={saveDraftSvg}
                    onClick={onOpenSaveTemplateDialog}
                    disabled={!value}
                    useRcTooltip={false}
                  />
                </span>
              </RcTooltip>
              <RcTooltip title="Load a template.">
                <span>
                  <RcIconButton
                    symbol={noteSvg}
                    disabled={!loadTemplateEnabled}
                    useRcTooltip={false}
                    onClick={onOpenLoadTemplateDialog}
                  />
                </span>
              </RcTooltip>
              <RcIconButton
                symbol={signatureSvg}
                title="Load a signature."
                onClick={onOpenSignatureDialog}
              />
            </MessageToolLineRight>
          )
        }
      </MessageToolLine>
      <EmojiPopper
        open={emojiOpen}
        onEmojiSelect={(emoji) => {
          setEmojiOpen(false);
          onEmojiAdded(emoji);
        }}
        anchorEl={emojiButtonRef && emojiButtonRef.current}
        placement={emojiWindowPlacement}
      />
      <MessageTextarea
        name="message"
        variant="outline"
        value={value}
        onChange={onChange}
        required
        fullWidth
        multiline
        minRows={minRows}
        placeholder="Enter text message"
        inputRef={inputRef}
        autoFocus
        onKeyUp={onKeyUp}
        disabled={disabled}
      />
    </Root>
  );
}
