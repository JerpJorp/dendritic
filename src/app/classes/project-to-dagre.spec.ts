import { Project } from './project';
import { ProjectToDagre } from './project-to-dagre';

describe('ProjectToDagre', () => {
  it('should create an instance', () => {
    const p: Project = new Project({name: 'test'});
    expect(new ProjectToDagre(p)).toBeTruthy();
  });
});
