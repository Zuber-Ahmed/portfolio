'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiArrowDown,
  FiExternalLink,
  FiMessageCircle,
  FiRefreshCw,
  FiSend,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

import { askInvitation } from '@/app/services/wedding/invitationService';

export default function ChatWidget({ token, invitation }) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [failedQuestion, setFailedQuestion] = useState('');
  const context = useRef({});
  const controller = useRef(null);
  const log = useRef(null);
  const input = useRef(null);
  const panel = useRef(null);
  const launcher = useRef(null);
  const followReplies = useRef(true);
  const [unread, setUnread] = useState(false);
  const [viewport, setViewport] = useState(null);
  useEffect(() => {
    const visual = window.visualViewport;
    const resize = () => {
      setViewport(
        visual
          ? {
              height: visual.height,
              width: visual.width,
              top: visual.offsetTop,
              left: visual.offsetLeft,
            }
          : null,
      );
    };
    resize();
    window.addEventListener('resize', resize);
    visual?.addEventListener('resize', resize);
    visual?.addEventListener('scroll', resize);
    return () => {
      window.removeEventListener('resize', resize);
      visual?.removeEventListener('resize', resize);
      visual?.removeEventListener('scroll', resize);
    };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    panel.current?.querySelector("[aria-label='Close assistant']")?.focus();
    function keydown(event) {
      if (event.key === 'Escape' && panel.current?.contains(event.target)) {
        event.preventDefault();
        setExpanded(false);
        requestAnimationFrame(() => launcher.current?.focus());
      }
    }
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [expanded]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (log.current && followReplies.current)
      log.current.scrollTop = log.current.scrollHeight;
  }, [messages, busy, expanded]);

  function close() {
    setExpanded(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }
  function goToRSVP() {
    close();
    const target = document.getElementById('invitation-rsvp');
    target?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
    requestAnimationFrame(() => target?.focus({ preventScroll: true }));
  }

  async function send(question, retry = false) {
    const message = question.trim();
    if (!message || busy || message.length > 1000 || controller.current) return;
    controller.current = new AbortController();
    const activeController = controller.current;
    const timeout = setTimeout(() => activeController.abort(), 15000);
    setBusy(true);
    followReplies.current = true;
    setUnread(false);
    setError('');
    setDraft('');
    if (!retry)
      setMessages(previous => [
        ...previous,
        { role: 'user', content: message },
      ]);
    try {
      const reply = await askInvitation(
        token,
        message,
        context.current,
        activeController.signal,
      );
      context.current = reply.context;
      setMessages(previous => [
        ...previous,
        { role: 'assistant', content: reply.answer, links: reply.links },
      ]);
      if (!followReplies.current) setUnread(true);
      setFailedQuestion('');
    } catch (failure) {
      setError(
        failure.name === 'AbortError'
          ? 'The reply took too long. Please try again.'
          : failure.message,
      );
      setFailedQuestion(message);
    } finally {
      clearTimeout(timeout);
      controller.current = null;
      setBusy(false);
    }
  }

  function clear() {
    setMessages([]);
    setError('');
    setFailedQuestion('');
    context.current = {};
    setUnread(false);
    followReplies.current = true;
    input.current?.focus();
  }

  if (!viewport) return null;

  return createPortal(
    <div
      className={`wedding-v2 wedding-v2-chat ${expanded ? 'is-open' : ''}`}
      style={
        viewport
          ? {
              height: viewport.height,
              width: viewport.width,
              top: viewport.top,
              left: viewport.left,
            }
          : undefined
      }>
      <button
        ref={launcher}
        className="wedding-v2-chat-launcher"
        type="button"
        title="Ask about the invitation"
        aria-label="Ask about the invitation"
        aria-expanded={expanded}
        aria-controls="invitation-chat-panel"
        aria-haspopup="dialog"
        onClick={() => (expanded ? close() : setExpanded(true))}>
        <FiMessageCircle aria-hidden="true" />
      </button>
      <section
        id="invitation-chat-panel"
        ref={panel}
        className="wedding-v2-chat-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="invitation-chat-title"
        aria-hidden={!expanded}
        inert={!expanded}>
        <header>
          <FiMessageCircle aria-hidden="true" />
          <div className="wedding-v2-chat-heading">
            <h2 id="invitation-chat-title">Wedding Assistant</h2>
            <p>
              {invitation.wedding.couple.groomName} &amp;{' '}
              {invitation.wedding.couple.brideName}
            </p>
          </div>
          <button
            className="wedding-v2-chat-icon"
            type="button"
            title="Clear conversation"
            aria-label="Clear conversation"
            disabled={busy || !messages.length}
            onClick={clear}>
            <FiTrash2 />
          </button>
          <button
            className="wedding-v2-chat-icon"
            type="button"
            title="Close assistant"
            aria-label="Close assistant"
            onClick={close}>
            <FiX />
          </button>
        </header>
        <div className="wedding-v2-chat-body">
          <div
            className="wedding-v2-chat-log"
            ref={log}
            onScroll={() => {
              followReplies.current =
                log.current.scrollHeight -
                  log.current.scrollTop -
                  log.current.clientHeight <
                48;
              if (followReplies.current) setUnread(false);
            }}
            role="log"
            aria-label="Conversation"
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={busy}
            tabIndex={0}>
            <div className="wedding-v2-chat-message assistant">
              <span>Wedding Assistant</span>
              <p>Assalamu Alaikum! How may I help you with your invitation?</p>
            </div>
            {messages.map((message, index) => (
              <div
                className={`wedding-v2-chat-message ${message.role}`}
                key={index}>
                <span>
                  {message.role === 'user' ? 'You' : 'Wedding Assistant'}
                </span>
                <p>{message.content}</p>
                {message.links?.map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer">
                    {link.label}
                    <FiExternalLink aria-hidden="true" />
                  </a>
                ))}
              </div>
            ))}
            {busy && (
              <p className="wedding-v2-chat-pending" role="status">
                Preparing your reply...
              </p>
            )}
          </div>
          {unread && (
            <button
              type="button"
              className="wedding-v2-chat-new"
              onClick={() => {
                log.current.scrollTop = log.current.scrollHeight;
                followReplies.current = true;
                setUnread(false);
              }}>
              <FiArrowDown aria-hidden="true" />
              New reply
            </button>
          )}
          <div className="wedding-v2-chat-suggestions">
            {Object.keys(invitation.events).map(event => (
              <button
                type="button"
                disabled={busy}
                key={event}
                onClick={() => send(`When is the ${event}?`)}>
                {event === 'nikah' ? 'Nikah timing' : 'Walima timing'}
              </button>
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => send('Where is the venue?', false)}>
              Venue
            </button>
            <button type="button" onClick={goToRSVP}>
              Go to RSVP <FiArrowDown aria-hidden="true" />
            </button>
          </div>
          {error && (
            <div className="wedding-v2-chat-error" role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => send(failedQuestion, true)}
                disabled={busy}>
                <FiRefreshCw aria-hidden="true" />
                Retry
              </button>
            </div>
          )}
          <form
            className="wedding-v2-chat-composer"
            onSubmit={event => {
              event.preventDefault();
              send(draft);
            }}>
            <label
              className="wedding-v2-chat-sr-only"
              htmlFor="invitation-chat-question">
              Your question
            </label>
            <input
              id="invitation-chat-question"
              ref={input}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              maxLength={1000}
              placeholder="Your question..."
              autoComplete="off"
              enterKeyHint="send"
              disabled={busy}
            />
            <button
              className="wedding-v2-chat-icon"
              type="submit"
              title="Send question"
              aria-label="Send question"
              disabled={busy || !draft.trim()}>
              <FiSend aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </div>,
    document.body,
  );
}
