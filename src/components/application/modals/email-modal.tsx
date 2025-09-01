import React, { useState } from 'react';
import { Heading as AriaHeading } from 'react-aria-components';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';
import { TextArea } from '@/components/base/textarea/textarea';
import { CloseButton } from '@/components/base/buttons/close-button';
import { X } from '@untitledui/icons';

// Gmail Icon Component
const GmailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1067 1067" className={className} style={{fillRule:"evenodd",clipRule:"evenodd",strokeLinejoin:"round",strokeMiterlimit:2}}>
    <g>
      <path d="M1000.02,171.48c-0,-27.627 -10.975,-54.122 -30.51,-73.657c-19.535,-19.535 -46.03,-30.509 -73.657,-30.509l-725,-0c-27.627,-0 -54.122,10.974 -73.657,30.509c-19.535,19.535 -30.51,46.03 -30.51,73.657l0,725c0,27.627 10.975,54.122 30.51,73.657c19.535,19.535 46.03,30.51 73.657,30.51l725,-0c27.627,-0 54.122,-10.975 73.657,-30.51c19.535,-19.535 30.51,-46.03 30.51,-73.657l-0,-725Z" style={{fill:"#fff"}}/>
      <g>
        <path d="M200.017,359.054c-0,-19.262 7.652,-37.735 21.272,-51.355c13.62,-13.62 32.093,-21.272 51.354,-21.272c0.002,0 0.003,0 0.004,0c10.534,0 20.783,3.429 29.196,9.769c-0,-0 157.534,118.711 212.7,160.281c11.135,8.39 26.48,8.39 37.614,0l212.7,-160.281c8.414,-6.34 18.662,-9.769 29.197,-9.769c0.001,0 0.002,0 0.003,0c19.262,0 37.734,7.652 51.355,21.272c13.62,13.62 21.271,32.093 21.271,51.355c0,28.547 0,380.771 0,380.771c0,23.731 -19.237,42.969 -42.969,42.969l-94.783,0c-2.763,0 -5.412,-1.097 -7.366,-3.051c-1.953,-1.953 -3.051,-4.603 -3.051,-7.365c0,-48.176 0,-247.043 0,-247.043c0,-0 -119.26,89.869 -166.357,125.359c-11.134,8.39 -26.479,8.39 -37.614,-0c-47.097,-35.49 -166.357,-125.359 -166.357,-125.359l0,247.043c0,2.762 -1.097,5.412 -3.051,7.365c-1.953,1.954 -4.603,3.051 -7.366,3.051c-19.395,0 -62.043,0 -94.783,0c-23.731,0 -42.969,-19.238 -42.969,-42.969c-0,-105.472 -0,-380.771 -0,-380.771Z" style={{fill:"#e94335"}}/>
        <path d="M348.186,331.118l171.789,129.452c7.918,5.967 18.832,5.967 26.751,-0l171.788,-129.452l0,194.217c0,-0 -129.271,97.413 -171.788,129.452c-7.919,5.967 -18.833,5.967 -26.751,-0l-171.789,-129.452l0,-194.217Z" style={{fill:"#e94335"}}/>
        <path d="M348.186,331.118l0,444.268c0,4.091 -3.317,7.408 -7.408,7.408c-17.64,0 -63.235,0 -97.792,0c-23.731,0 -42.969,-19.238 -42.969,-42.969c-0,-105.472 -0,-380.771 -0,-380.771c-0,-19.262 7.652,-37.735 21.272,-51.355c13.62,-13.62 32.093,-21.272 51.354,-21.272c0.002,0 0.003,0 0.004,0c10.534,0 20.783,3.429 29.196,9.769l46.343,34.922Z" style={{fill:"#4284f7"}}/>
        <path d="M718.514,331.118l0,444.268c0,4.091 3.317,7.408 7.409,7.408c17.639,0 63.234,0 97.791,0c23.732,0 42.969,-19.238 42.969,-42.969c0,-105.472 0,-380.771 0,-380.771c0,-19.262 -7.651,-37.735 -21.271,-51.355c-13.621,-13.62 -32.093,-21.272 -51.355,-21.272c-0.001,0 -0.002,0 -0.003,0c-10.535,0 -20.783,3.429 -29.197,9.769l-46.343,34.922Z" style={{fill:"#34a853"}}/>
        <path d="M200.017,416.595l-0,-57.541c-0,-19.262 7.652,-37.735 21.272,-51.355c13.62,-13.62 32.093,-21.272 51.354,-21.272c0.002,0 0.003,0 0.004,0c10.534,0 20.783,3.429 29.196,9.769l46.343,34.922l0,194.217l-148.169,-108.74Z" style={{fill:"#c6221e"}}/>
        <path d="M866.683,416.595l0,-57.541c0,-19.262 -7.651,-37.735 -21.271,-51.355c-13.621,-13.62 -32.093,-21.272 -51.355,-21.272c-0.001,0 -0.002,0 -0.003,0c-10.535,0 -20.783,3.429 -29.197,9.769l-46.343,34.922l0,194.217l148.169,-108.74Z" style={{fill:"#fcbc05"}}/>
      </g>
    </g>
  </svg>
);

// Simple Email Tag Component
const EmailTag = ({ email, onRemove }: { email: string; onRemove: () => void }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-sm font-medium bg-primary text-secondary rounded-md ring-1 ring-primary ring-inset">
      {email}
      <button
        onClick={onRemove}
        className="inline-flex p-0.5 rounded hover:bg-primary_hover text-fg-quaternary hover:text-fg-quaternary_hover focus:outline-none"
        aria-label={`Remove ${email}`}
      >
        <X className="size-3" strokeWidth="3" />
      </button>
    </span>
  );
};

interface EmailModalProps {
  reportItem: {
    name: string;
    fileType: string;
    generationParams?: any;
  };
  onSend: (emailData: {
    recipients: string[];
    ccRecipients: string[];
    bccRecipients: string[];
    subject: string;
    message: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function EmailModal({ reportItem, onSend, onClose }: EmailModalProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [currentCc, setCurrentCc] = useState('');
  const [subject, setSubject] = useState(`Site Accreditation Report - ${reportItem.name}`);
  const [message, setMessage] = useState(
    `Please find attached Site Accreditation Report - ${reportItem.name}\n` +
    `This is an automated email from the Al Laith PMO System.`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addRecipient = (type: 'to' | 'cc') => {
    const input = type === 'to' ? currentRecipient : currentCc;
    const trimmedEmail = input.trim();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (type === 'to') {
      if (!recipients.includes(trimmedEmail)) {
        setRecipients([...recipients, trimmedEmail]);
        setCurrentRecipient('');
      }
    } else {
      if (!ccRecipients.includes(trimmedEmail)) {
        setCcRecipients([...ccRecipients, trimmedEmail]);
        setCurrentCc('');
      }
    }
    setError('');
  };

  const removeRecipient = (email: string, type: 'to' | 'cc') => {
    if (type === 'to') {
      setRecipients(recipients.filter(r => r !== email));
    } else {
      setCcRecipients(ccRecipients.filter(r => r !== email));
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    setSending(true);
    setError('');
    
    try {
      await onSend({
        recipients,
        ccRecipients,
        bccRecipients: [],
        subject,
        message
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-primary rounded-2xl shadow-xl border border-secondary w-full">
      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-secondary">
        <GmailIcon className="size-14 flex-shrink-0" />
        <div className="flex-1">
          <AriaHeading className="text-lg font-semibold text-primary">
            Send Report via Email
          </AriaHeading>
          <p className="mt-1 text-sm text-tertiary">
            Send "{reportItem.name}" as an email attachment
          </p>
        </div>
        <CloseButton 
          onClick={onClose}
          className="text-tertiary hover:text-secondary"
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Recipients */}
        <div>
          <Label>To</Label>
          <div className="flex gap-2 mb-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={currentRecipient}
              onChange={(value) => setCurrentRecipient(value)}
              onKeyPress={(e) => e.key === 'Enter' && addRecipient('to')}
            />
            <Button
              onClick={() => addRecipient('to')}
              size="sm"
              variant="secondary"
            >
              Add
            </Button>
          </div>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
                                      {recipients.map((email) => (
                          <EmailTag
                            key={email}
                            email={email}
                            onRemove={() => removeRecipient(email, 'to')}
                          />
                        ))}
            </div>
          )}
        </div>

        {/* CC */}
        <div>
          <Label>Cc (optional)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={currentCc}
              onChange={(value) => setCurrentCc(value)}
              onKeyPress={(e) => e.key === 'Enter' && addRecipient('cc')}
            />
            <Button
              onClick={() => addRecipient('cc')}
              size="sm"
              variant="secondary"
            >
              Add
            </Button>
          </div>
          {ccRecipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
                                      {ccRecipients.map((email) => (
                          <EmailTag
                            key={email}
                            email={email}
                            onRemove={() => removeRecipient(email, 'cc')}
                          />
                        ))}
            </div>
          )}
        </div>



        {/* Subject */}
        <div>
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(value) => setSubject(value)}
            placeholder="Email subject"
          />
        </div>

        {/* Message */}
        <div>
          <Label>Message</Label>
          <TextArea
            value={message}
            onChange={(value) => setMessage(value)}
            placeholder="Email message"
            rows={5}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-error-primary">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-secondary bg-tertiary rounded-b-2xl">
        <Button
          onClick={onClose}
          variant="secondary"
          size="md"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={sending || recipients.length === 0}
          loading={sending}
          size="md"
        >
          {sending ? 'Sending...' : 'Send Email'}
        </Button>
      </div>
    </div>
  );
}